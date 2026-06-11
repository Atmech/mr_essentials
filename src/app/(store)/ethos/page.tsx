import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function EthosPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BORN IN STRUCTURE</h1>
      <div className={styles.content}>
        <p>
          MR ESSENTIALS is your destination for premium men&rsquo;s and kids&rsquo; streetwear. We stock a carefully curated selection from an established brand — built on precision, utility, and lasting construction.
        </p>
        <p>
          We don&rsquo;t make the clothes. We find the best ones. Every piece in our store is sourced from a brand that engineers garments for the urban wardrobe, where function meets precision and quality is non-negotiable.
        </p>
        <p>
          Hoodies, tees, shorts, pants, tracksuits, jackets. For men and kids. No compromises. Just essentials.
        </p>
      </div>

      <div className={styles.imageWrapper}>
        <Image src="/images/black_fabric.png" alt="Ethos Textures" fill className={styles.image} />
      </div>
    </div>
  );
}
