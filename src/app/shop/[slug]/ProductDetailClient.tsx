'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import Button from '@/components/ui/Button/Button';
import ColorSwatch from '@/components/ui/ColorSwatch/ColorSwatch';
import { Accordion } from '@/components/ui/Accordion';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import { Heart, Minus, Plus, Share2 } from 'lucide-react';

import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useToastStore } from '@/lib/store/toast';

export default function ProductDetailClient({ product, relatedProducts }: { product: any; relatedProducts: any[] }) {
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);

  const productSizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const productColors = product.colors || [{ name: 'Standard', hex: '#222222' }];

  const [selectedSize, setSelectedSize] = useState(productSizes[0]);
  const [selectedColor, setSelectedColor] = useState(productColors[0]);
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = wishlistStore.isWishlisted(product.id);

  const handleAddToCart = () => {
    cartStore.addItem({
      id: `${product.slug}-${selectedSize}-${selectedColor.name}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || '/logo.jpeg',
      size: selectedSize,
      color: selectedColor.name,
    });
    cartStore.openCart();
    addToast({ message: `${product.name} added to cart`, type: 'success' });
  };

  const handleWishlistToggle = () => {
    const added = wishlistStore.toggleItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/logo.jpeg',
      category: product.category,
    });
    addToast({
      message: added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`,
      type: added ? 'success' : 'info',
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      addToast({ message: 'Link copied to clipboard', type: 'info' });
    }
  };

  const images = (product.images && product.images.length > 0) ? product.images : ['/logo.jpeg'];

  return (
    <div className={styles.pageWrapper}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href="/shop">Collection</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      <div className={styles.container}>
        <div className={styles.gallery}>
          {images.map((img: string, idx: number) => (
            <div key={idx} className={styles.imageWrapper}>
              <Image 
                src={img} 
                alt={`${product.name} ${idx + 1}`} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.image} 
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        <div className={styles.details}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.name}>{product.name}</h1>
              <span className={styles.price}>£{product.price.toFixed(2)}</span>
            </div>
            <div className={styles.headerActions}>
              <button
                className={`${styles.iconBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                onClick={handleWishlistToggle}
                aria-label="Toggle wishlist"
              >
                <Heart size={22} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className={styles.iconBtn} onClick={handleShare} aria-label="Share">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div>
            <span className={styles.label}>Color: {selectedColor.name}</span>
            <div className={styles.colorGrid}>
              {productColors.map((c: any) => (
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
             <span className={styles.label}>Size</span>
             <div className={styles.sizeGrid}>
               {productSizes.map((s: string) => (
                 <button
                   key={s}
                   className={`${styles.sizeButton} ${selectedSize === s ? styles.selected : ''}`}
                   onClick={() => setSelectedSize(s)}
                 >
                   {s}
                 </button>
               ))}
             </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <span className={styles.label}>Quantity</span>
            <div className={styles.qtySelector}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => q + 1)}
                disabled={quantity >= (product.inStock || 99)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className={styles.accordionGroup}>
            <Accordion title="Description" defaultOpen>
              <p>{product.description || 'No description provided.'}</p>
            </Accordion>
            <Accordion title="Fabric & Care">
              <p><strong>Fabric:</strong> {product.fabric || 'Heavyweight 100% Cotton'}</p>
              <p><strong>Care:</strong> {product.care || 'Machine wash cold. Do not tumble dry.'}</p>
            </Accordion>
            <Accordion title="Fit & Information">
              <p><strong>Fit:</strong> {product.fit || 'True to size. Oversized.'}</p>
              <p><strong>Category:</strong> {product.category}</p>
            </Accordion>
          </div>

          <div className={styles.buttonWrapper}>
            <Button variant="primary" style={{ width: '100%' }} onClick={handleAddToCart} disabled={product.inStock <= 0}>
              {product.inStock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      {product.features && product.features.length > 0 && (
        <div className={styles.featuresWrapper}>
          {product.features.map((feature: any, idx: number) => (
            <div key={idx} className={styles.featureBlock}>
              <div className={styles.featureContent}>
                <div className={styles.featureNumber}>0{idx + 1}.</div>
                <h2 className={styles.featureTitle}>{feature.title}</h2>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
              {feature.image && (
                <div className={styles.featureImageWrapper}>
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill 
                    sizes="100vw"
                    className={styles.image} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>YOU MAY ALSO LIKE</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((rp) => (
              <Link key={rp.id} href={`/shop/${rp.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
                <ProductCard
                  title={rp.name}
                  description={rp.category}
                  image={rp.images?.[0] || '/logo.jpeg'}
                  price={`£${rp.price.toFixed(2)}`}
                  ctaLabel="View details"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
