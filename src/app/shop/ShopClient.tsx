'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import Link from 'next/link';
import { Select } from '@/components/ui/Select';
import { useSearchParams } from 'next/navigation';
import { Heart, Plus, Minus } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useToastStore } from '@/lib/store/toast';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc';

export default function ShopClient({ liveProducts }: { liveProducts: any[] }) {
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('category') || 'all';
  
  const [filterCategory, setFilterCategory] = useState<string>(defaultCategory);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const wishlistStore = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setFilterCategory(cat);
    else setFilterCategory('all');
  }, [searchParams]);

  const filteredAndSorted = useMemo(() => {
    let result = liveProducts.filter((p) => 
      filterCategory === 'all' ? true : p.category.toLowerCase() === filterCategory.toLowerCase()
    );

    switch (sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result = [...result].sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [liveProducts, filterCategory, sortBy]);

  const handleWishlistToggle = (e: React.MouseEvent, product: any) => {
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

  return (
    <div className={styles.shopLayout}>
      <header className={styles.header}>
        <h1 className={styles.title}>COLLECTION</h1>
        <p className="label">Browse our complete collection.</p>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader} onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            <button type="button" className={styles.filterToggleBtn} aria-label="Toggle filters">
              {isFiltersOpen ? <Minus size={18} /> : <Plus size={18} />}
            </button>
          </div>
          
          <div className={`${styles.filterContent} ${isFiltersOpen ? styles.open : ''}`}>
            <div className={styles.filterGroup}>
            <Select 
              label="Category"
              value={filterCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Items' },
                { value: 'hoodies', label: 'Hoodies' },
                { value: 'trackpants', label: 'Trackpants' },
                { value: 'tracksuits', label: 'Tracksuits' },
                { value: 'jackets', label: 'Jackets' },
              ]}
            />
          </div>

          <div className={styles.filterGroup}>
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortOption)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'price-asc', label: 'Price: Low → High' },
                { value: 'price-desc', label: 'Price: High → Low' },
                { value: 'name-asc', label: 'Name: A → Z' },
              ]}
            />
          </div>
          </div>
        </aside>

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
                    <Heart size={18} fill={wishlistStore.isWishlisted(product.id) ? 'currentColor' : 'none'} />
                  </button>
                  <ProductCard
                    title={product.name}
                    description={product.category || 'Collection'}
                    image={product.images?.[0] || '/logo.jpeg'}
                    price={`£${product.price.toFixed(2)}`}
                    ctaLabel="View details"
                    badge={product.inStock < 5 ? 'Limited' : undefined}
                  />
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
