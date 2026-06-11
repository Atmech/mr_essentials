'use client';

import styles from './page.module.css';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl') || '/account';
    signIn('google', { callbackUrl });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>IDENTIFICATION</h1>
          <p className={styles.subtitle}>ACCESS YOUR LEDGER</p>
        </div>

        <Button onClick={handleGoogleLogin} variant="secondary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <span>CONTINUE WITH GOOGLE</span>
        </Button>

        <div className={styles.linksContainer}>
          <Link href="/shop" className={styles.metaLink}>
            RETURN TO COLLECTION
          </Link>
        </div>
      </div>
    </div>
  );
}
