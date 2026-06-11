'use client';

import React from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useToastStore } from '@/lib/store/toast';
import Button from '@/components/ui/Button/Button';

export default function WishlistClient() {
  const { items, removeItem } = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);

  const handleRemove = (productId: number, name: string) => {
    removeItem(productId);
    addToast({ message: `${name} removed from wishlist`, type: 'info' });
  };

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/account">Account</Link>
        <span className={styles.sep}>/</span>
        <span>Wishlist</span>
      </nav>

      <h1 className={styles.title}>WISHLIST</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <Heart size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>YOUR WISHLIST IS EMPTY</p>
          <p className={styles.emptySubtext}>Save items you love to find them later</p>
          <Link href="/shop">
            <Button variant="primary">BROWSE COLLECTION</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.productId} className={styles.card}>
              <Link href={`/shop/${item.slug}`} className={styles.cardLink}>
                <div className={styles.imageWrap}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardName}>{item.name}</h3>
                  <span className={styles.cardCategory}>{item.category}</span>
                  <span className={styles.cardPrice}>£{(item.price / 100).toFixed(2)}</span>
                </div>
              </Link>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(item.productId, item.name)}
                aria-label="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
