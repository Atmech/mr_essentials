'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Heart, SlidersHorizontal, X } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useToastStore } from '@/lib/store/toast';
import { CATEGORIES as CATEGORY_CONST } from '@/lib/constants';
import { formatGBP, effectivePence, isOnSale } from '@/lib/format';
import type { Product } from '@/lib/types';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

// 'All' option + the canonical taxonomy (single source of truth).
const CATEGORIES = [{ value: 'all', label: 'All' }, ...CATEGORY_CONST];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
];

export default function ShopClient({ liveProducts }: { liveProducts: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  // The URL is the single source of truth for category — no mirrored state,
  // so no setState-in-effect and no risk of the two drifting.
  const filterCategory = searchParams.get('category') || 'all';

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const wishlistStore = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);

  const setCategory = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('gender');
    if (val === 'all') params.delete('category');
    else params.set('category', val);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const filteredAndSorted = useMemo(() => {
    // gender + sale are already filtered server-side; refine by category here.
    const result = liveProducts.filter((p) =>
      filterCategory === 'all' ? true : p.category?.toLowerCase() === filterCategory.toLowerCase(),
    );
    const eff = (p: Product) => effectivePence(p);

    switch (sortBy) {
      case 'price-asc': return [...result].sort((a, b) => eff(a) - eff(b));
      case 'price-desc': return [...result].sort((a, b) => eff(b) - eff(a));
      case 'name-asc': return [...result].sort((a, b) => a.name.localeCompare(b.name));
      default: return [...result].sort((a, b) => b.id - a.id);
    }
  }, [liveProducts, filterCategory, sortBy]);

  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
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

  const activeCategory = CATEGORIES.find((c) => c.value === filterCategory);
  const activeSort = SORT_OPTIONS.find((s) => s.value === sortBy);

  return (
    <div className={styles.shopLayout}>

      {/* ── Filter bar ── */}
      <div className={styles.filterBar}>
        <div className={styles.filterBarLeft}>
          <span className={styles.filterBarTitle}>
            {activeCategory?.value === 'all' ? 'ALL' : activeCategory?.label?.toUpperCase()}
          </span>
          <span className={styles.filterBarCount}>{filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'product' : 'products'}</span>
        </div>

        {/* Category pills — desktop */}
        <nav className={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`${styles.pill} ${filterCategory === cat.value ? styles.pillActive : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        <div className={styles.filterBarRight}>
          {/* Sort select */}
          <div className={styles.sortWrap}>
            <label className={styles.sortLabel}>Sort</label>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile filter toggle */}
          <button className={styles.mobileFilterBtn} onClick={() => setMobileFiltersOpen(true)}>
            <SlidersHorizontal size={16} />
            <span>Filter</span>
            {filterCategory !== 'all' && <span className={styles.filterDot} />}
          </button>
        </div>
      </div>

      {/* Active filter chip */}
      {filterCategory !== 'all' && (
        <div className={styles.activeFilters}>
          <button className={styles.activeChip} onClick={() => setCategory('all')}>
            {activeCategory?.label} <X size={12} />
          </button>
        </div>
      )}

      {/* ── Product grid ── */}
      <section className={styles.productGrid}>
        {filteredAndSorted.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>∅</p>
            <p className={styles.emptyText}>NO PRODUCTS FOUND</p>
            <p className={styles.emptySubtext}>Try adjusting your filters</p>
          </div>
        ) : (
          filteredAndSorted.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`} className={styles.productLink}>
              <div className={styles.productCardWrap}>
                <button
                  className={`${styles.wishlistBtn} ${wishlistStore.isWishlisted(product.id) ? styles.wishlisted : ''}`}
                  onClick={(e) => handleWishlistToggle(e, product)}
                  aria-label="Toggle wishlist"
                >
                  <Heart size={16} fill={wishlistStore.isWishlisted(product.id) ? 'currentColor' : 'none'} />
                </button>
                <ProductCard
                  title={product.name}
                  description={product.category || 'Collection'}
                  image={product.images?.[0] || '/logo.jpeg'}
                  price={formatGBP(effectivePence(product))}
                  originalPrice={isOnSale(product) ? formatGBP(product.price) : undefined}
                  badge={isOnSale(product) ? 'Sale' : product.inStock < 5 ? 'Limited' : undefined}
                />
              </div>
            </Link>
          ))
        )}
      </section>

      {/* ── Mobile filter drawer ── */}
      {mobileFiltersOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setMobileFiltersOpen(false)}>
          <div className={styles.mobileDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.mobileDrawerTitle}>FILTERS</span>
              <button onClick={() => setMobileFiltersOpen(false)}><X size={20} /></button>
            </div>
            <div className={styles.mobileDrawerSection}>
              <p className={styles.mobileDrawerLabel}>CATEGORY</p>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  className={`${styles.mobileDrawerItem} ${filterCategory === cat.value ? styles.mobileDrawerItemActive : ''}`}
                  onClick={() => { setCategory(cat.value); setMobileFiltersOpen(false); }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className={styles.mobileDrawerSection}>
              <p className={styles.mobileDrawerLabel}>SORT BY</p>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.mobileDrawerItem} ${sortBy === opt.value ? styles.mobileDrawerItemActive : ''}`}
                  onClick={() => { setSortBy(opt.value); setMobileFiltersOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
