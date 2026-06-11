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
import { formatGBP, effectivePence, isOnSale } from '@/lib/format';
import type { Product } from '@/lib/types';

export default function ProductDetailClient({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }) {
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);

  const productSizes = product.sizes || ['S', 'M', 'L', 'XL'];
  const productColors = product.colors || [{ name: 'Standard', hex: '#222222' }];
  const images: string[] = (product.images && product.images.length > 0) ? product.images : ['/logo.jpeg'];

  const [selectedSize, setSelectedSize] = useState(productSizes[0]);
  const [selectedColor, setSelectedColor] = useState(productColors[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const isWishlisted = wishlistStore.isWishlisted(product.id);
  const isLowStock = product.inStock > 0 && product.inStock <= 5;

  const handleAddToCart = () => {
    cartStore.addItem({
      id: `${product.slug}-${selectedSize}-${selectedColor.name}`,
      productId: product.id,
      name: product.name,
      price: effectivePence(product),
      quantity,
      image: images[0],
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
      image: images[0],
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
      addToast({ message: 'Link copied', type: 'info' });
    }
  };

  return (
    <div className={styles.pageWrapper}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href="/shop">Collection</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href={`/shop?category=${product.category?.toLowerCase()}`}>{product.category}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      <div className={styles.container}>

        {/* ── Gallery ── */}
        <div className={styles.gallerySection}>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className={styles.thumbStrip}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`${styles.thumb} ${activeImage === idx ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image src={img} alt="" fill sizes="72px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className={styles.mainImageWrap}>
            <Image
              src={images[activeImage]}
              alt={`${product.name} — image ${activeImage + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className={styles.mainImage}
              priority
            />
            {/* Image counter */}
            {images.length > 1 && (
              <span className={styles.imageCounter}>{activeImage + 1} / {images.length}</span>
            )}
          </div>

          {/* Mobile dot nav */}
          {images.length > 1 && (
            <div className={styles.mobileDots}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`${styles.dot} ${activeImage === idx ? styles.dotActive : ''}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Details panel ── */}
        <div className={styles.details}>

          {/* Header: name + price + actions */}
          <div className={styles.header}>
            <div className={styles.headerMeta}>
              <span className={styles.category}>{product.category}</span>
              <h1 className={styles.name}>{product.name}</h1>
              <div className={styles.priceRow}>
                {isOnSale(product) ? (
                  <span className={styles.price}>
                    {formatGBP(effectivePence(product))}{' '}
                    <s style={{ opacity: 0.5, fontWeight: 400 }}>{formatGBP(product.price)}</s>
                  </span>
                ) : (
                  <span className={styles.price}>{formatGBP(product.price)}</span>
                )}
                {isLowStock && (
                  <span className={styles.lowStock}>Only {product.inStock} left</span>
                )}
                {product.inStock <= 0 && (
                  <span className={styles.outOfStock}>Out of stock</span>
                )}
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={`${styles.iconBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                onClick={handleWishlistToggle}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className={styles.iconBtn} onClick={handleShare} aria-label="Share">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Color */}
          {productColors.length > 0 && (
            <div className={styles.section}>
              <span className={styles.label}>Colour — <span className={styles.labelValue}>{selectedColor.name}</span></span>
              <div className={styles.colorGrid}>
                {productColors.map((c) => (
                  <button
                    key={c.name}
                    className={`${styles.swatchWrapper} ${selectedColor.name === c.name ? styles.swatchSelected : ''}`}
                    onClick={() => setSelectedColor(c)}
                    aria-label={c.name}
                  >
                    <ColorSwatch name={c.name} hex={c.hex} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className={styles.section}>
            <span className={styles.label}>Size — <span className={styles.labelValue}>{selectedSize}</span></span>
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

          {/* Qty + Add to Cart */}
          <div className={styles.addRow}>
            <div className={styles.qtySelector}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity((q) => q + 1)}
                disabled={quantity >= (product.inStock || 99)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <Button
              variant="primary"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={product.inStock <= 0}
            >
              {product.inStock > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
            </Button>
          </div>

          {/* Accordions */}
          <div className={styles.accordionGroup}>
            {product.description && (
              <Accordion title="Description" defaultOpen>
                <p>{product.description}</p>
              </Accordion>
            )}
            <Accordion title="Fabric & Care">
              {product.fabric && <p><strong>Fabric:</strong> {product.fabric}</p>}
              {product.care && <p><strong>Care:</strong> {product.care}</p>}
              {!product.fabric && !product.care && <p>Heavyweight 100% Cotton. Machine wash cold. Do not tumble dry.</p>}
            </Accordion>
            <Accordion title="Fit & Sizing">
              <p>{product.fit || 'True to size. Model wears size M.'}</p>
            </Accordion>
          </div>

        </div>
      </div>

      {/* Features */}
      {product.features && product.features.length > 0 && (
        <div className={styles.featuresWrapper}>
          {product.features.map((feature, idx) => (
            <div key={idx} className={styles.featureBlock}>
              <div className={styles.featureContent}>
                <div className={styles.featureNumber}>0{idx + 1}.</div>
                <h2 className={styles.featureTitle}>{feature.title}</h2>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
              {feature.image && (
                <div className={styles.featureImageWrapper}>
                  <Image src={feature.image} alt={feature.title} fill sizes="100vw" className={styles.mainImage} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>YOU MAY ALSO LIKE</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((rp) => (
              <Link key={rp.id} href={`/shop/${rp.slug}`} className={styles.relatedLink}>
                <ProductCard
                  title={rp.name}
                  description={rp.category}
                  image={rp.images?.[0] || '/logo.jpeg'}
                  price={formatGBP(effectivePence(rp))}
                  originalPrice={isOnSale(rp) ? formatGBP(rp.price) : undefined}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
