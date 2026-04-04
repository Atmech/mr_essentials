'use client';

import React, { useState, use } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import { mockProducts } from '@/lib/data/products';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import ColorSwatch from '@/components/ui/ColorSwatch/ColorSwatch';
import { Accordion } from '@/components/ui/Accordion';
import { Select } from '@/components/ui/Select';
import { useCartStore } from '@/lib/store/cart';

export default function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const product = mockProducts.find((p) => p.slug === params.slug);
  const cartStore = useCartStore();

  if (!product) {
    notFound();
  }

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  const handleAddToCart = () => {
    cartStore.addItem({
      id: `${product.slug}-${selectedSize}-${selectedColor.name}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor.name,
    });
    cartStore.openCart();
  };

  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        {product.images.map((img, idx) => (
          <div key={idx} className={styles.imageWrapper}>
            <Image 
              src={img} 
              alt={`${product.name} ${idx + 1}`} 
              fill 
              className={styles.image} 
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      <div className={styles.details}>
        <div className={styles.header}>
          <h1 className={styles.name}>{product.name}</h1>
          <span className={styles.price}>£{product.price.toFixed(2)}</span>
        </div>

        <div>
          <span className={styles.label}>Color: {selectedColor.name}</span>
          <div className={styles.colorGrid}>
            {product.colors.map((c) => (
              <div 
                key={c.name} 
                className={styles.swatchWrapper} 
                onClick={() => setSelectedColor(c)}
                style={{ outline: selectedColor.name === c.name ? '2px solid var(--color-alert-red)' : 'none' }}
              >
                <ColorSwatch name={c.name} hex={c.hex} />
              </div>
            ))}
          </div>
        </div>

        <div>
           <Select 
            label="Size"
            value={selectedSize}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSize(e.target.value)}
            options={product.sizes.map(s => ({ value: s, label: s }))}
           />
        </div>

        <div className={styles.accordionGroup}>
          <Accordion title="Description" defaultOpen>
            <p>{product.description}</p>
          </Accordion>
          <Accordion title="Fabric & Care">
            <p><strong>Fabric:</strong> {product.fabric}</p>
            <p><strong>Care:</strong> {product.care}</p>
          </Accordion>
          <Accordion title="Fit & Shipping">
            <p><strong>Fit:</strong> {product.fit}</p>
            <p><strong>Shipping:</strong> Free shipping on orders over £200. Express delivery available at checkout.</p>
          </Accordion>
        </div>

        <div className={styles.buttonWrapper}>
          <Button variant="primary" style={{ width: '100%' }} onClick={handleAddToCart}>
            {product.inStock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
          </Button>
        </div>
      </div>
    </div>
  );
}
