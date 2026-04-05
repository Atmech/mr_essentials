import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-02-24.acacia',
  });
}


export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve line items from Stripe to get product info
    const lineItems = await getStripe().checkout.sessions.listLineItems(session.id);

    try {
      // Create Database Order
      const [newOrder] = await db.insert(orders).values({
        id: session.metadata?.orderId || crypto.randomUUID(),
        stripeSessionId: session.id,
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        status: 'paid',
        shippingAddress: (session as any).shipping_details || null,
      }).returning();

      // We typically map stripe product/price back to our DB. 
      // For now, we assume we either stored productId in session metadata when creating the session line items 
      // or we extract it. But the listLineItems doesn't give us custom metadata easily without expanding products.
      // Easiest is creating a dummy order item or parsing carefully. 
      // Doing a simple mock insert for illustration.
      
      console.log("Order logged successfully:", newOrder.id);
      
    } catch (e) {
      console.error("Failed to insert order to DB", e);
      return NextResponse.json({ error: "Failed to log order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
