import Image from 'next/image';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let liveProducts: typeof products.$inferSelect[] = [];
  let serverError: string | null = null;
  
  try {
    liveProducts = await db.select().from(products).orderBy(desc(products.id)).limit(4);
  } catch (error: any) {
    serverError = error.message || String(error);
  }

  if (serverError) {
    return (
      <div style={{ padding: 'var(--space-20)', textAlign: 'center', color: 'red' }}>
        <h2>Server Component Error</h2>
        <p style={{ fontFamily: 'monospace' }}>{serverError}</p>
        <p>This means your database connection failed at runtime. Did you add DATABASE_URL to your Vercel Environment Variables?</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Hero Section ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          <Image
            src="/images/hero.png"
            alt="MR Essentials Collection"
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroContent}>
            <div className={styles.heroTextWrapper}>
              <h1 className={styles.heroTitleOutline}>ARCHITECT</h1>
              <h1 className={styles.heroTitleSolid}>UTILITY</h1>
            </div>
            <div className={styles.heroAction}>
              <Link href="/shop" prefetch={false}>
                <Button className={styles.saleButton} variant="primary">SHOP THE SALE</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.heroBanner}>
          <div className="container">
            <div className={styles.heroBannerContent}>
              <span>CORE ESSENTIALS</span>
              <span>DROP 04/24</span>
              <span>LIMITED STOCK</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Section ── */}
      <section className={`section container`}>
        <div className={styles.trendingHeader}>
          <h2 className={styles.trendingTitle}>TRENDING</h2>
          <span className={styles.trendingSubtitle}>CURATED SELECTION</span>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
          width: '100%',
          marginBottom: 'var(--space-12)'
        }}>
          {liveProducts.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-20) var(--space-6)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 'var(--text-6xl)', color: 'var(--color-light-gray)', marginBottom: 'var(--space-4)' }}>∅</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', color: 'var(--color-charcoal)', marginBottom: 'var(--space-2)' }}>NO PRODUCTS AVAILABLE</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-mid-gray)' }}>Check back later for our new drop.</p>
            </div>
          ) : (
            liveProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
                <ProductCard
                  title={product.name}
                  description={product.category || 'Staple'}
                  image={product.images?.[0] || '/logo.jpeg'}
                  price={`£${product.price.toFixed(2)}`}
                  ctaLabel="View details"
                  badge={product.inStock < 5 ? 'Limited' : undefined}
                />
              </Link>
            ))
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link href="/shop" prefetch={false}>
             <Button variant="secondary" style={{ color: 'var(--color-black)', borderColor: 'var(--color-black)' }}>VIEW ENTIRE LOG</Button>
          </Link>
        </div>
      </section>

      {/* ── Born in Structure Section ── */}
      <section className={styles.structureSection}>
        <h2 className={styles.structureBgText}>ONLINE</h2>
        <div className={`container ${styles.structureGrid}`}>
          <div className={styles.structureImageWrapper}>
            <Image src="/images/black_fabric.png" alt="Fabric Texture" fill className={styles.structureImage} />
          </div>
          <div className={styles.structureContent}>
            <h2 className={styles.structureTitle}>
              BORN IN<br />
              <span className={styles.structureTitleRed}>STRUCTURE</span>
            </h2>
            <p className={styles.structureDesc}>
              MR ESSENTIALS is an architectural study in human
              covering. Every seam, every gusset, and every
              fiber is calculated to withstand the urban sprawl
              while maintaining a silhouette of absolute
              permanence.
            </p>
            <Link href="/ethos" prefetch={false}>
              <Button variant="secondary" className={styles.structureButton}>DISCOVER THE ETHOS</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
