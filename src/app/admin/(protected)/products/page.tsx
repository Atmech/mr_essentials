import React from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import Link from 'next/link';

export default async function AdminProductsPage() {
  const allProducts = await db.select().from(products);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)' }}>PRODUCTS</h1>
        <Link 
          href="/admin/products/new" 
          style={{
            padding: 'var(--space-3) var(--space-6)',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none',
            letterSpacing: 'var(--tracking-wider)',
          }}
        >
          + ADD NEW IDENTIFIER
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {allProducts.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mid-gray)' }}>NO PRODUCTS FOUND IN DATABASE.</p>
        ) : (
          allProducts.map(product => (
            <div key={product.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: 'var(--space-4)', 
              border: '1px solid var(--color-charcoal)',
              gap: 'var(--space-4)'
            }}>
              <div style={{ width: 60, height: 60, backgroundColor: 'var(--color-charcoal)', flexShrink: 0, backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>{product.name}</h3>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>{product.slug} | {product.category}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)' }}>£{product.price.toFixed(2)}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: product.inStock > 0 ? 'var(--color-white)' : 'var(--color-alert-red)' }}>
                  STOCK: {product.inStock}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
