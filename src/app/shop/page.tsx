'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import { mockProducts } from '@/lib/data/products';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import Link from 'next/link';
import { Select } from '@/components/ui/Select';
import { useCartStore } from '@/lib/store/cart';

export default function ShopPage() {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const cartStore = useCartStore();

  const filteredProducts = mockProducts.filter((p) => 
    filterCategory === 'all' ? true : p.category.toLowerCase() === filterCategory.toLowerCase()
  );

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    cartStore.addItem({
      id: product.slug, // using slug as item ID for now
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      size: product.sizes[0], // default size
    });
    cartStore.openCart(); // optional: open drawer on add
  };

  return (
    <div className={styles.shopLayout}>
      <header className={styles.header}>
        <h1 className={styles.title}>INVENTORY</h1>
        <p className="label">Browse our complete brutalist collection.</p>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Filters</h2>
          
          <div className={styles.filterGroup}>
            <Select 
              label="Category"
              value={filterCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Items' },
                { value: 'staple', label: 'Staple' },
                { value: 'utility', label: 'Utility' },
              ]}
            />
          </div>
        </aside>

        <section className={styles.productGrid}>
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
              <ProductCard
                title={product.name}
                description={product.slug}
                image={product.images[0]}
                price={`£${product.price.toFixed(2)}`}
                ctaLabel="View details"
                badge={product.inStock < 50 ? 'Limited' : undefined}
                onCtaClick={() => {/* link wraps it */}}
              />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
