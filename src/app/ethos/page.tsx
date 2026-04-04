import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function EthosPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BORN IN STRUCTURE</h1>
      <div className={styles.content}>
        <p>
          MR ESSENTIALS is an architectural study in human covering. Every seam, every gusset, and every fiber is calculated to withstand the urban sprawl while maintaining a silhouette of absolute permanence.
        </p>
        <p>
          We do not create fashion. We engineer garments designed for utility, structure, and clinical precision. The Blood Line Collection operates on the tension between cold, brutalist expression and functional wearability. 
        </p>
        <p>
          Each piece is rigorously tested, iterating on form until unnecessary elements are eliminated. What remains is only the essential. By redefining the baseline of modern uniforms, we ensure our garments serve the wearer relentlessly.
        </p>
      </div>

      <div className={styles.imageWrapper}>
        <Image src="/images/black_fabric.png" alt="Ethos Textures" fill className={styles.image} />
      </div>
    </div>
  );
}
