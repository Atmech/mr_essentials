import 'server-only';
import type Stripe from 'stripe';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, orderItems, products, coupons } from '@/lib/db/schema';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

type SettleResult = 'settled' | 'already' | 'missing';

/**
 * Mark a pending order paid + decrement stock + store the shipping address.
 *
 * Called from BOTH the Stripe webhook and the /checkout/success page, so it is
 * idempotent AND race-safe: the pending→paid flip is a single conditional UPDATE;
 * only the caller that actually flips it (rowcount 1) goes on to decrement stock.
 * A concurrent or replayed caller sees 0 rows and returns 'already'.
 *
 * The claim matches status = 'pending' exactly — a replayed webhook arriving after
 * the admin moved the order on (shipped/delivered/cancelled) must not drag it back
 * to 'paid' or double-decrement stock.
 */
export async function settleOrder(orderId: string, checkout: Stripe.Checkout.Session): Promise<SettleResult> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return 'missing';
  if (order.status !== 'pending') return 'already';

  // Field name for shipping varies by Stripe API version — read defensively.
  const details = checkout as unknown as {
    shipping_details?: unknown;
    collected_information?: { shipping_details?: unknown };
    customer_details?: unknown;
  };

  // totalAmount was computed authoritatively from DB prices at checkout (minus any
  // custom coupon). It only needs correcting when Stripe applied a discount we did
  // not know about — i.e. a promotion code entered on the Stripe payment page.
  const chargedTotal = typeof checkout.amount_total === 'number' ? checkout.amount_total : null;
  const stripeDiscount = checkout.total_details?.amount_discount ?? 0;

  const claimed = await db
    .update(orders)
    .set({
      status: 'paid',
      stripeSessionId: checkout.id,
      ...(chargedTotal != null && chargedTotal !== order.totalAmount ? { totalAmount: chargedTotal } : {}),
      ...(stripeDiscount > 0 && stripeDiscount > order.discountAmount ? { discountAmount: stripeDiscount } : {}),
      shippingAddress: {
        shipping: details.shipping_details ?? details.collected_information?.shipping_details ?? null,
        customer: details.customer_details ?? null,
      },
    })
    .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')))
    .returning({ id: orders.id });

  // Lost the race / already settled — don't double-decrement stock.
  if (claimed.length === 0) return 'already';

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  let oversold = false;
  for (const it of items) {
    const decremented = await db
      .update(products)
      .set({ inStock: sql`${products.inStock} - ${it.quantity}` })
      .where(sql`${products.id} = ${it.productId} AND ${products.inStock} >= ${it.quantity}`)
      .returning({ id: products.id });
    if (decremented.length === 0) {
      // Paid order but stock ran out between checkout and settlement — flag it so
      // the admin sees the oversell instead of inventory silently drifting.
      oversold = true;
      console.error(`[settle] OVERSELL order=${orderId} product=${it.productId} qty=${it.quantity} — stock not decremented`);
    }
  }
  if (oversold) {
    await db.update(orders).set({ oversold: true }).where(eq(orders.id, orderId));
  }

  // Redeem the coupon. The claim above guarantees this runs exactly once per order.
  if (order.couponCode) {
    await db
      .update(coupons)
      .set({ usedCount: sql`${coupons.usedCount} + 1` })
      .where(eq(coupons.code, order.couponCode));
  }

  // Best-effort invoice links — the invoice.paid webhook backfills if Stripe
  // hasn't finalized the invoice yet.
  try {
    const invoiceId = typeof checkout.invoice === 'string' ? checkout.invoice : checkout.invoice?.id;
    if (invoiceId && isStripeConfigured()) {
      const invoice = await getStripe().invoices.retrieve(invoiceId);
      if (invoice.hosted_invoice_url || invoice.invoice_pdf) {
        await db
          .update(orders)
          .set({ invoiceUrl: invoice.hosted_invoice_url ?? null, invoicePdf: invoice.invoice_pdf ?? null })
          .where(eq(orders.id, orderId));
      }
    }
  } catch (err) {
    console.error(`[settle] invoice fetch failed for order=${orderId}`, err);
  }

  return 'settled';
}
