import React from 'react';
import styles from './page.module.css';
import Badge from '@/components/ui/Badge/Badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, ne, and, desc } from 'drizzle-orm';
import { formatGBP } from '@/lib/format';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders — MR Essentials' };

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/account/login');

  // Exclude 'pending' rows — those are unpaid/abandoned checkouts, not real orders.
  const userOrders = await db.query.orders.findMany({
    where: and(eq(orders.userId, session.user.id), ne(orders.status, 'pending')),
    orderBy: [desc(orders.createdAt)],
    with: { items: { with: { product: true } } },
  });

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/account">Account</Link>
        <span className={styles.sep}>/</span>
        <span>Orders</span>
      </nav>

      <h1 className={styles.title}>ORDER HISTORY</h1>

      <div className={styles.orderList}>
        {userOrders.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>📦</p>
            <p className={styles.emptyText}>NO ORDERS YET</p>
            <p className={styles.emptySubtext}>Your acquisition history will appear here</p>
            <Link href="/shop" className={styles.emptyLink}>BROWSE COLLECTION</Link>
          </div>
        ) : (
          userOrders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className={styles.orderDate}>{new Date(order.createdAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.orderTotal}>
                    {formatGBP(order.totalAmount)}
                    {order.discountAmount > 0 && (
                      <span className={styles.orderDate}> ({order.couponCode ?? 'discount'} −{formatGBP(order.discountAmount)})</span>
                    )}
                  </span>
                  <Badge variant={order.status === 'delivered' ? 'default' : 'alert'}>{order.status.toUpperCase()}</Badge>
                  {order.trackingUrl && (
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className={styles.trackLink}>
                      TRACK ORDER →
                    </a>
                  )}
                  {order.invoiceUrl && (
                    <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className={styles.trackLink}>
                      INVOICE →
                    </a>
                  )}
                </div>
              </div>

              <ul className={styles.orderItems}>
                {order.items.map(item => (
                  <li key={item.id} className={styles.orderItemRow}>
                    <span className={styles.orderItemName}>
                      {item.quantity}× {item.product?.name ?? `Item #${item.productId}`}
                      {(item.size || item.color) && (
                        <span className={styles.orderItemVariant}>
                          {' '}— {[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </span>
                    <span className={styles.orderItemPrice}>{formatGBP(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
