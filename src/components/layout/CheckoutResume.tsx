'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart';

/**
 * After a guest is bounced to login mid-checkout, this reopens the cart when
 * they land back on the site so they can finish in one click (flag set by CartDrawer).
 */
export default function CheckoutResume() {
  const openCart = useCartStore((s) => s.openCart);
  useEffect(() => {
    try {
      if (localStorage.getItem('mre_resume_checkout')) {
        localStorage.removeItem('mre_resume_checkout');
        openCart();
      }
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, [openCart]);
  return null;
}
