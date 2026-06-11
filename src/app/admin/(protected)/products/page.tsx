import React from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { isOnSale } from '@/lib/format';

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  padding: '2px 8px',
  border: 'var(--border-thin)',
  letterSpacing: 'var(--tracking-wider)',
};

export default async function AdminProductsPage() {
  const allProducts = await db.select().from(products).orderBy(desc(products.id));

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>{product.name}</h3>
                  {product.archived && <span style={{ ...badgeStyle, color: 'var(--color-alert-red)', borderColor: 'var(--color-alert-red)' }}>ARCHIVED</span>}
                  {product.featured && <span style={badgeStyle}>FEATURED</span>}
                  {isOnSale(product) && <span style={badgeStyle}>ON SALE</span>}
                  {product.salePrice != null && !isOnSale(product) && <span style={{ ...badgeStyle, color: 'var(--color-mid-gray)' }}>SALE SCHEDULED</span>}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>{product.slug} | {product.category}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)' }}>£{(product.price / 100).toFixed(2)}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: product.inStock > 0 ? 'var(--color-white)' : 'var(--color-alert-red)' }}>
                  STOCK: {product.inStock}
                </p>
              </div>
              <Link
                href={`/admin/products/${product.id}/edit`}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  border: 'var(--border-thin)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  textDecoration: 'none',
                  letterSpacing: 'var(--tracking-wider)',
                }}
              >
                EDIT
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
