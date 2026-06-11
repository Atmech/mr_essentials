import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lookbook — MR Essentials' };

export default async function LookbookPage() {
  const allProducts = await db.select({
    id: products.id,
    name: products.name,
    images: products.images,
    slug: products.slug,
  }).from(products);

  const allImages = allProducts.flatMap((p) =>
    (p.images || []).map((img) => ({ src: img, name: p.name, slug: p.slug }))
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>LOOKBOOK</h1>
        <p className={styles.subtitle}>CAMPAIGN 01</p>
      </header>

      <div className={styles.gallery}>
        {allImages.length === 0 ? (
          <p className={styles.empty}>NO CAMPAIGN IMAGES AVAILABLE</p>
        ) : (
          allImages.map((img, idx) => (
            <div key={idx} className={styles.imageWrap}>
              <Image
                src={img.src}
                alt={`${img.name} — Campaign Shot`}
                fill
                className={styles.image}
                sizes="(max-width: 768px) 80vw, 50vw"
              />
              <div className={styles.imageLabel}>{img.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
