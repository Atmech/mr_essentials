'use server';

import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { ORDER_STATUSES, ORDER_TRANSITIONS, type OrderStatus } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Stripe checkout sessions expire after 24h — a pending order younger than that
// might still settle, so cancelling it could strand a paid-but-cancelled charge.
const PENDING_CANCEL_MIN_AGE_MS = 24 * 60 * 60 * 1000;

export async function updateOrderStatus(formData: FormData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  // Validation failures surface as a banner on the page, never the error boundary.
  let errorMessage: string | null = null;
  try {
    const id = formData.get('orderId') as string;
    const status = formData.get('status') as string;
    const trackingNumber = ((formData.get('trackingNumber') as string) || '').trim() || null;
    const trackingUrl = ((formData.get('trackingUrl') as string) || '').trim() || null;

    if (!id) throw new Error('Missing order id.');
    if (!(ORDER_STATUSES as readonly string[]).includes(status)) throw new Error('Invalid status.');

    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) throw new Error('Order not found.');
    const from = order.status as OrderStatus;
    const to = status as OrderStatus;

    if (to === from) {
      // Same status = tracking-only update; allowed in any state.
      await db.update(orders).set({ trackingNumber, trackingUrl }).where(eq(orders.id, id));
    } else if (!ORDER_TRANSITIONS[from]?.includes(to)) {
      throw new Error(`Cannot move an order from '${from}' to '${to}'.`);
    } else if (to === 'cancelled' && (from === 'paid' || from === 'shipped')) {
      // Stock was decremented at settlement, so cancelling returns it. The claim is
      // a single conditional UPDATE (mirrors settleOrder): only the caller that
      // actually flips the status restocks, so a double-submit or a second admin
      // can't double-restock.
      const claimed = await db
        .update(orders)
        .set({ status: 'cancelled', trackingNumber, trackingUrl })
        .where(and(eq(orders.id, id), inArray(orders.status, ['paid', 'shipped'])))
        .returning({ id: orders.id });

      if (claimed.length === 1 && !order.oversold) {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
        for (const it of items) {
          await db
            .update(products)
            .set({ inStock: sql`${products.inStock} + ${it.quantity}` })
            .where(eq(products.id, it.productId));
        }
      }
      // Oversold orders skip auto-restock: some of their stock was never decremented,
      // so blindly adding it back would inflate inventory. Adjust stock via the
      // product edit page instead.
    } else {
      if (from === 'pending' && to === 'cancelled') {
        const ageMs = Date.now() - (order.createdAt?.getTime() ?? 0);
        if (ageMs < PENDING_CANCEL_MIN_AGE_MS) {
          throw new Error('Pending checkouts can be cancelled once they are older than 24 hours (the Stripe session may still complete).');
        }
      }
      // Guard on the expected current status so a concurrent settle/cancel isn't clobbered.
      await db
        .update(orders)
        .set({ status: to, trackingNumber, trackingUrl })
        .where(and(eq(orders.id, id), eq(orders.status, from)));
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Failed to update the order.';
  }

  if (errorMessage) {
    redirect(`/admin/orders?error=${encodeURIComponent(errorMessage)}`);
  }
  revalidatePath('/admin/orders');
}
