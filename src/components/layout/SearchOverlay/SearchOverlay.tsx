'use client';

import React, { useState } from 'react';
import styles from './SearchOverlay.module.css';
import { useUIStore } from '@/lib/store/ui';
import { X, Search } from 'lucide-react';
import { mockProducts } from '@/lib/data/products';
import Link from 'next/link';

export const SearchOverlay = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const results = query.trim() === '' 
    ? [] 
    : mockProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <Search size={24} className={styles.icon} />
          <input 
            type="text" 
            placeholder="SEARCH INVENTORY..." 
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <button className={styles.closeBtn} onClick={closeSearch}>
          <X size={32} />
        </button>
      </div>

      <div className={styles.results}>
        {query && results.length === 0 && (
          <p className={styles.noResults}>NO RESULTS FOUND FOR "{query}"</p>
        )}
        
        {results.map((product) => (
          <Link key={product.id} href={`/shop/${product.slug}`} className={styles.resultItem} onClick={closeSearch}>
            <span className={styles.resultName}>{product.name}</span>
            <span className={styles.resultPrice}>£{product.price.toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
