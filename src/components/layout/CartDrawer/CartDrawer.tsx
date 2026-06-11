'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './CartDrawer.module.css';
import { useCartStore } from '@/lib/store/cart';
import { useToastStore } from '@/lib/store/toast';
import { formatGBP } from '@/lib/format';
import Button from '@/components/ui/Button/Button';
import { X, Minus, Plus } from 'lucide-react';

export const CartDrawer = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, couponCode, setCouponCode } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send only identity + quantity + variant (+ coupon code). The server
        // resolves price from the DB and validates the coupon.
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          couponCode: couponCode.trim() || undefined,
        }),
      });

      if (response.status === 401) {
        // Not signed in — flag a resume, bounce to login, then return to this page
        // (CheckoutResume reopens the cart so they can finish in one click).
        try { localStorage.setItem('mre_resume_checkout', '1'); } catch { /* ignore */ }
        const back = window.location.pathname + window.location.search;
        window.location.href = `/account/login?callbackUrl=${encodeURIComponent(back)}`;
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      // No silent "success" fallback — a failed checkout must never look like a sale.
      addToast({ message: data.error || 'Checkout could not be started. Please try again.', type: 'error' });
    } catch {
      addToast({ message: 'Network error during checkout. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={closeCart} />}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>CART</h2>
          <button onClick={closeCart} className={styles.closeBtn} aria-label="Close cart">
            <X size={28} />
          </button>
        </div>

        <div className={styles.items}>
          {items.length === 0 ? (
            <p className={styles.emptyMsg}>YOUR CART IS EMPTY</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImageWrap}>
                  <Image src={item.image} alt={item.name} fill className={styles.itemImage} />
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.itemMeta}>
                    <span>{item.color}</span>
                    <span>SIZE: {item.size}</span>
                  </div>
                  <div className={styles.itemFooter}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className={styles.itemPrice}>{formatGBP(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="COUPON CODE (OPTIONAL)"
              aria-label="Coupon code"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: 'var(--border-thin)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: 'var(--tracking-wider)',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-3)',
              }}
            />
            <div className={styles.summary}>
              <span className={styles.summaryLabel}>SUBTOTAL</span>
              <span className={styles.summaryTotal}>{formatGBP(total)}</span>
            </div>
            <p className={styles.taxNotice}>Discounts, taxes and shipping applied at checkout.</p>
            <Button variant="primary" style={{ width: '100%' }} onClick={handleCheckout} disabled={loading}>
              {loading ? 'STARTING CHECKOUT…' : 'PROCEED TO SECURE CHECKOUT'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
