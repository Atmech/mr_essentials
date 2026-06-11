import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { getStripe } from '@/lib/stripe';
import { settleOrder } from '@/lib/orders';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed: without the signing secret we cannot trust any payload.
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature';
    console.error('[webhook] signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  // Invoice links can finalize after settlement — backfill them by the orderId
  // we stamped into invoice_data.metadata at checkout. (Enable the invoice.paid
  // event on the Stripe webhook endpoint in production.)
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    const invoiceOrderId = invoice.metadata?.orderId;
    if (invoiceOrderId && (invoice.hosted_invoice_url || invoice.invoice_pdf)) {
      try {
        await db
          .update(orders)
          .set({ invoiceUrl: invoice.hosted_invoice_url ?? null, invoicePdf: invoice.invoice_pdf ?? null })
          .where(eq(orders.id, invoiceOrderId));
      } catch (err) {
        console.error('[webhook] invoice backfill failed for order', invoiceOrderId, err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
      }
    }
    return NextResponse.json({ received: true });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const checkout = event.data.object as Stripe.Checkout.Session;
  const orderId = checkout.metadata?.orderId;
  console.log('[webhook] checkout.session.completed for order', orderId);

  if (!orderId) {
    return NextResponse.json({ received: true, note: 'no orderId in metadata' });
  }

  try {
    const result = await settleOrder(orderId, checkout);
    console.log('[webhook] order', orderId, '->', result);
    return NextResponse.json({ received: true, result });
  } catch (err) {
    console.error('[webhook] processing failed for order', orderId, err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
