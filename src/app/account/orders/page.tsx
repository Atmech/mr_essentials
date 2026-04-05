import React from 'react';
import styles from './page.module.css';
import Badge from '@/components/ui/Badge/Badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders — MR Essentials' };

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/account/login');

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt));

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
              <div className={styles.orderMeta}>
                <span className={styles.orderId}>{order.id.slice(0, 8).toUpperCase()}</span>
                <span className={styles.orderDate}>{new Date(order.createdAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className={styles.orderRight}>
                <span className={styles.orderTotal}>£{order.totalAmount.toFixed(2)}</span>
                <Badge variant={order.status === 'delivered' ? 'default' : 'alert'}>{order.status.toUpperCase()}</Badge>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className={styles.trackLink}>
                    TRACK ORDER →
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
