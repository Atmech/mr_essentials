'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/store/cart';

/** Clears the client cart once, after a confirmed-paid checkout. */
export default function ClearCart() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
