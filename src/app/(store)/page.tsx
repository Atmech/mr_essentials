import styles from './page.module.css';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import { desc, eq } from 'drizzle-orm';
import { ArrowRight } from 'lucide-react';
import { formatGBP, effectivePence, isOnSale } from '@/lib/format';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { href: '/shop?category=hoodies',    label: 'Hoodies' },
  { href: '/shop?category=tees',       label: 'Tees' },
  { href: '/shop?category=tracksuits', label: 'Tracksuits' },
  { href: '/shop?category=jackets',    label: 'Jackets' },
  { href: '/shop?category=shorts',     label: 'Shorts' },
  { href: '/shop?category=pants',      label: 'Pants' },
  { href: '/shop?category=accessories', label: 'Accessories' },
];

export default async function Home() {
  let liveProducts: typeof products.$inferSelect[] = [];
  let serverError: string | null = null;

  try {
    // Featured products first, then newest — archived ones never surface.
    liveProducts = await db
      .select()
      .from(products)
      .where(eq(products.archived, false))
      .orderBy(desc(products.featured), desc(products.id))
      .limit(8);
  } catch (error) {
    serverError = error instanceof Error ? error.message : String(error);
  }

  if (serverError) {
    return (
      <div className={styles.errorState}>
        <h2>Database connection failed</h2>
        <pre>{serverError}</pre>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Drop 04/24 — Limited Stock</p>
          <h1 className={styles.heroHeading}>
            <span className={styles.heroLine}>CORE</span>
            <span className={styles.heroLine}>ESSENTIALS</span>
          </h1>
          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.heroCta}>
              Shop Collection <ArrowRight size={16} />
            </Link>
            <Link href="/shop?sale=true" className={styles.heroCtaSecondary}>
              Sale →
            </Link>
          </div>
        </div>

        {/* Ticker */}
        <div className={styles.ticker}>
          <div className={styles.tickerTrack}>
            {[...Array(6)].map((_, i) => (
              <span key={i} className={styles.tickerItem}>
                CORE ESSENTIALS <span className={styles.tickerDot}>·</span> DROP 04/24 <span className={styles.tickerDot}>·</span> LIMITED STOCK <span className={styles.tickerDot}>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── New In ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionMeta}>
            <span className={styles.sectionLabel}>New In</span>
            <span className={styles.sectionCount}>{liveProducts.length} pieces</span>
          </div>
          <Link href="/shop" className={styles.sectionLink}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {liveProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>∅</p>
            <p className={styles.emptyText}>No products yet. Check back for our next drop.</p>
          </div>
        ) : (
          <div className={styles.productGrid}>
            {liveProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`} className={styles.productLink}>
                <ProductCard
                  title={product.name}
                  description={product.category || 'Staple'}
                  image={product.images?.[0] || '/logo.jpeg'}
                  price={formatGBP(effectivePence(product))}
                  originalPrice={isOnSale(product) ? formatGBP(product.price) : undefined}
                  badge={isOnSale(product) ? 'Sale' : product.inStock < 5 ? 'Limited' : undefined}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Category strip ── */}
      <section className={styles.categorySection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Shop by Category</span>
        </div>
        <div className={styles.categoryStrip}>
          {CATEGORIES.map((cat) => (
            <Link key={cat.href} href={cat.href} className={styles.categoryItem}>
              <span className={styles.categoryName}>{cat.label}</span>
              <ArrowRight size={16} className={styles.categoryArrow} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Brand bar ── */}
      <section className={styles.brandBar}>
        <div className={styles.brandBarInner}>
          <p className={styles.brandBarQuote}>&ldquo;BORN IN STRUCTURE.&rdquo;</p>
          <Link href="/ethos" className={styles.brandBarLink}>
            Our Ethos <ArrowRight size={14} />
          </Link>
        </div>
      </section>

    </div>
  );
}
