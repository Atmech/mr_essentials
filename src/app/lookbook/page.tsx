import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function LookbookPage() {
  const images = [
    '/images/hero.png',
    '/images/heavy_hoodie.png',
    '/images/utility_trackpants.png',
    '/images/box_fit_tee.png'
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>CAMPAIGN 01</h1>
      </header>

      <div className={styles.gallery}>
        {images.map((img, idx) => (
          <div key={idx} className={styles.imageWrap}>
            <Image src={img} alt={`Campaign Shot ${idx}`} fill className={styles.image} />
          </div>
        ))}
      </div>
    </div>
  );
}
