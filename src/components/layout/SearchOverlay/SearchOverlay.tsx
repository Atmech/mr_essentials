'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './SearchOverlay.module.css';
import { useUIStore } from '@/lib/store/ui';
import { X, Search } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: string;
  images: string[] | null;
}

export const SearchOverlay = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (!isSearchOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <div className={styles.searchBar}>
          <Search size={24} className={styles.icon} />
          <input 
            type="text" 
            placeholder="SEARCH COLLECTION..." 
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
        {loading && (
          <p className={styles.noResults}>SEARCHING...</p>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className={styles.noResults}>NO RESULTS FOUND FOR &quot;{query}&quot;</p>
        )}
        
        {results.map((product) => (
          <Link key={product.id} href={`/shop/${product.slug}`} className={styles.resultItem} onClick={closeSearch}>
            <div className={styles.resultImageWrap}>
              <Image
                src={product.images?.[0] || '/logo.jpeg'}
                alt={product.name}
                fill
                sizes="60px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.resultInfo}>
              <span className={styles.resultName}>{product.name}</span>
              <span className={styles.resultCategory}>{product.category}</span>
            </div>
            <span className={styles.resultPrice}>£{product.price.toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
