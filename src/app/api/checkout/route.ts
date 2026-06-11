import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { inArray } from 'drizzle-orm';
import { authOptions } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { products, orders, orderItems } from '@/lib/db/schema';
import { effectivePence } from '@/lib/format';
import { validateCoupon } from '@/lib/coupons';

// Stripe rejects payment-mode sessions under £0.30.
const STRIPE_MIN_CHARGE_PENCE = 30;

const YOUR_DOMAIN = process.env.NEXTAUTH_URL || 'http://localhost:3000';

type IncomingItem = { productId: number; quantity: number; size?: string; color?: string };

// Structural shape accepted by Stripe's `line_items` param (avoids deep namespace types).
type StripeLineItem = {
  price_data: {
    currency: string;
    product_data: { name: string; images: string[]; metadata: Record<string, string> };
    unit_amount: number;
  };
  quantity: number;
};

export async function POST(req: Request) {
  try {
    // Checkout requires an authenticated user — every order is tied to a userId.
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be signed in to check out.' }, { status: 401 });
    }

    const body = await req.json();
    const rawItems: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];

    // Sanitize incoming items — trust only productId + quantity + variant, never price.
    const wanted = new Map<number, IncomingItem>();
    for (const it of rawItems) {
      const id = Number(it?.productId);
      const qty = Number(it?.quantity);
      if (!Number.isInteger(id) || !Number.isInteger(qty) || qty <= 0) continue;
      // collapse duplicate ids (same product added twice) by summing quantity
      const prev = wanted.get(id);
      wanted.set(id, { productId: id, quantity: (prev?.quantity ?? 0) + qty, size: it.size, color: it.color });
    }
    if (wanted.size === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Resolve authoritative prices + stock from the DB.
    const rows = await db.select().from(products).where(inArray(products.id, [...wanted.keys()]));
    const byId = new Map(rows.map((p) => [p.id, p]));

    const lineItems: StripeLineItem[] = [];
    const orderId = crypto.randomUUID();
    const itemsToInsert: (typeof orderItems.$inferInsert)[] = [];
    let totalPence = 0;

    for (const it of wanted.values()) {
      const p = byId.get(it.productId);
      if (!p || p.archived) {
        return NextResponse.json(
          { error: `${p?.name ?? `Product ${it.productId}`} is no longer available.` },
          { status: 409 }
        );
      }
      if (p.inStock < it.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${p.name}.` }, { status: 409 });
      }
      const unit = effectivePence(p);
      totalPence += unit * it.quantity;

      const image = p.images?.[0] ?? '/logo.jpeg';
      lineItems.push({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: p.name,
            images: [new URL(image, YOUR_DOMAIN).toString()],
            metadata: { productId: String(p.id), size: it.size ?? '', color: it.color ?? '' },
          },
          unit_amount: unit,
        },
        quantity: it.quantity,
      });
      itemsToInsert.push({
        orderId,
        productId: p.id,
        quantity: it.quantity,
        price: unit,
        size: it.size,
        color: it.color,
      });
    }

    // Optional store coupon — validated server-side against the DB subtotal.
    const rawCode = typeof body?.couponCode === 'string' ? body.couponCode.trim().toUpperCase() : '';
    let discountPence = 0;
    let appliedCode: string | null = null;
    if (rawCode) {
      const check = await validateCoupon(rawCode, totalPence);
      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }
      if (totalPence - check.discountPence < STRIPE_MIN_CHARGE_PENCE) {
        return NextResponse.json({ error: 'Coupon value exceeds the order total.' }, { status: 400 });
      }
      discountPence = check.discountPence;
      appliedCode = check.coupon.code;
    }

    // Pre-create a pending order + its items (atomic via neon batch). The webhook
    // flips this to 'paid' and decrements stock once payment is confirmed.
    await db.batch([
      db.insert(orders).values({
        id: orderId,
        userId: session.user.id,
        totalAmount: totalPence - discountPence,
        status: 'pending',
        couponCode: appliedCode,
        discountAmount: discountPence,
      }),
      db.insert(orderItems).values(itemsToInsert),
    ]);

    const stripe = getStripe();

    // Stripe forbids combining `discounts` with `allow_promotion_codes`: a store
    // coupon rides as a one-off Stripe coupon; otherwise the payment page offers
    // its own promotion-code field (codes managed in the Stripe dashboard).
    const discountParams = appliedCode
      ? {
          discounts: [
            {
              coupon: (
                await stripe.coupons.create({
                  // amount_off (not percent_off) so our pence rounding is authoritative
                  // and the charge matches the stored totalAmount exactly.
                  amount_off: discountPence,
                  currency: 'gbp',
                  duration: 'once' as const,
                  name: appliedCode,
                })
              ).id,
            },
          ],
        }
      : { allow_promotion_codes: true };

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${YOUR_DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/shop`,
      metadata: { orderId },
      // Stripe generates a proper invoice for every completed checkout; the
      // orderId in invoice metadata lets the invoice.paid webhook find the order.
      invoice_creation: { enabled: true, invoice_data: { metadata: { orderId } } },
      ...discountParams,
      // Collect a delivery address (and prefill the buyer's email) at checkout.
      shipping_address_collection: { allowed_countries: ['GB'] },
      phone_number_collection: { enabled: true },
      customer_email: session.user.email ?? undefined,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
