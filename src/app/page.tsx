import Image from 'next/image';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';

export default function Home() {
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
              <Button className={styles.saleButton} variant="primary">SHOP THE SALE</Button>
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
        
        <div className={styles.trendingGrid}>
          {/* Main Item */}
          <div className={`${styles.productCard} ${styles.productMain}`}>
            <div className={styles.productImageWrapper}>
              <Image src="/images/heavy_hoodie.png" alt="HEAVY HOODIE 01" fill className={styles.productImage} />
            </div>
            <div className={styles.productInfo}>
              <span className={styles.productCategory}>STAPLE COLLECTION</span>
              <div className={styles.productFooter}>
                <h3 className={styles.productName}>HEAVY HOODIE 01</h3>
                <span className={styles.productPriceSale}>£120.00</span>
              </div>
            </div>
          </div>

          <div className={styles.productCard}>
            <div className={styles.productImageWrapperCompact}>
              <Image src="/images/utility_trackpants.png" alt="UTILITY TRACKPANTS" fill className={styles.productImage} />
            </div>
            <div className={styles.productInfoCompact}>
              <h3 className={styles.productNameCompact}>UTILITY TRACKPANTS</h3>
              <span className={styles.productPrice}>£85.00</span>
            </div>
          </div>

          <div className={styles.productCard}>
            <div className={styles.productImageWrapperCompact}>
              <Image src="/images/box_fit_tee.png" alt="BOX FIT TEE" fill className={styles.productImage} />
            </div>
            <div className={styles.productInfoCompact}>
              <h3 className={styles.productNameCompact}>BOX FIT TEE</h3>
              <span className={styles.productPrice}>£65.00</span>
            </div>
          </div>
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
            <Button variant="secondary" className={styles.structureButton}>DISCOVER THE ETHOS</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
