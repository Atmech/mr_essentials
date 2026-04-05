'use client';

import React, { useEffect } from 'react';
import styles from './page.module.css';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>TRANSACTION <span className={styles.titleRed}>SECURED</span></h1>
      <p className={styles.message}>
        Your acquisition has been logged into the ledger. You will receive transmission regarding your shipping status shortly.
      </p>
      <div className={styles.btnWrap}>
        <Link href="/account" passHref legacyBehavior>
          <Button variant="secondary">VIEW LEDGER</Button>
        </Link>
        <Link href="/shop" passHref legacyBehavior>
          <Button variant="primary">RETURN TO COLLECTION</Button>
        </Link>
      </div>
    </div>
  );
}
