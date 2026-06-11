import React from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Returns — MR Essentials',
  description: 'Shipping rates, delivery times, and return policy for MR Essentials.',
};

export default function ShippingPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>SHIPPING & RETURNS</h1>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>SHIPPING</h2>
          <div className={styles.table}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Standard (UK)</span>
              <span className={styles.rowValue}>3-5 Business Days — £4.99</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Express (UK)</span>
              <span className={styles.rowValue}>1-2 Business Days — £9.99</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>International</span>
              <span className={styles.rowValue}>7-14 Business Days — £14.99</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Free Shipping</span>
              <span className={styles.rowValue}>On orders over £100 (UK only)</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>RETURNS</h2>
          <p className={styles.text}>
            We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in original packaging with all tags attached.
          </p>
          <p className={styles.text}>
            To initiate a return, please contact us at <strong>returns@mressentials.com</strong> with your order number.
          </p>
          <p className={styles.text}>
            Refunds are processed within 5-7 business days of receiving the returned item. Original shipping costs are non-refundable.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>EXCHANGES</h2>
          <p className={styles.text}>
            We do not currently offer direct exchanges. Please return the original item and place a new order.
          </p>
        </section>
      </div>

      <div className={styles.cta}>
        <Link href="/shop" className={styles.ctaLink}>
          ← BACK TO COLLECTION
        </Link>
      </div>
    </div>
  );
}
