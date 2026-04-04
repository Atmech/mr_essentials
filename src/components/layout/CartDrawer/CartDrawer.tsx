'use client';

import React from 'react';
import Image from 'next/image';
import styles from './CartDrawer.module.css';
import { useCartStore } from '@/lib/store/cart';
import Button from '@/components/ui/Button/Button';
import { X, Minus, Plus } from 'lucide-react';

export const CartDrawer = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback for POC if no Stripe url is returned (e.g. no keys)
        closeCart();
        window.location.href = '/checkout/success';
      }
    } catch (error) {
      console.error("Checkout failed, running mock fallback", error);
      closeCart();
      window.location.href = '/checkout/success';
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
                    <span className={styles.itemPrice}>£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summary}>
              <span className={styles.summaryLabel}>SUBTOTAL</span>
              <span className={styles.summaryTotal}>£{total.toFixed(2)}</span>
            </div>
            <p className={styles.taxNotice}>Taxes and shipping calculated at checkout.</p>
            <Button variant="primary" style={{ width: '100%' }} onClick={handleCheckout}>
              PROCEED TO SECURE CHECKOUT
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
