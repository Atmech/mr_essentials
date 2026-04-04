'use client';

import React from 'react';
import styles from './page.module.css';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';

export default function AccountPage() {
  const handleLogout = () => {
    // POC fake logout
    window.location.href = '/account/login';
  };

  // Mock orders
  const orders = [
    { id: '#ORD-0921', date: '2026-03-12', total: 120.00, status: 'DELIVERED' },
    { id: '#ORD-1154', date: '2026-04-01', total: 205.00, status: 'PROCESSING' }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>LEDGER</h1>
          <p className={styles.subtitle}>USER_ID: 10A-F9</p>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>TERMINATE SESSION</button>
      </header>

      <div className={styles.dashboard}>
        <section>
          <h2 className={styles.sectionTitle}>ACQUISITION HISTORY</h2>
          <div className={styles.orderList}>
            {orders.length === 0 ? (
              <div className={styles.noOrders}>NO RECORDS FOUND IN REGISTRY</div>
            ) : (
              orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                    <span className={styles.orderTotal}>£{order.total.toFixed(2)}</span>
                  </div>
                  <div className={styles.statusWrap}>
                    <Badge variant={order.status === 'DELIVERED' ? 'default' : 'alert'}>{order.status}</Badge>
                    <Button variant="secondary" size="sm">VIEW DETAILS</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>SHIPPING REGISTRY</h2>
          <div className={styles.orderCard}>
            <div className={styles.orderMeta}>
              <span className={styles.orderId}>PRIMARY DIRECTIVE</span>
              <span className={styles.orderDate}>123 BRUTALIST AVE, SECTOR 4</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
