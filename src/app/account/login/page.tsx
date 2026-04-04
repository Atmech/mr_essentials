'use client';

import React from 'react';
import styles from './page.module.css';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // Attempt to grab callbackUrl from standard URL string to bounce them back to /admin
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl') || '/account';
    
    signIn('google', { callbackUrl });
  };

  const handleFakeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for POC purposes for the Secure Code flow
    window.location.href = '/account';
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>IDENTIFICATION</h1>
          <p className={styles.subtitle}>ACCESS YOUR LEDGER</p>
        </div>

        <form className={styles.form} onSubmit={handleFakeLogin}>
          <Input 
            label="EMAIL ADDRESS OR PHONE" 
            placeholder="ENTER DETAILS"
            type="text" 
          />
          <Button variant="primary" type="submit" style={{ width: '100%' }}>
            REQUEST SECURE CODE
          </Button>
        </form>

        <div className={styles.divider}>OR</div>

        <Button onClick={handleGoogleLogin} variant="secondary" style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <span>CONTINUE WITH GOOGLE</span>
        </Button>

        <Link href="/shop" className={styles.metaLink}>
          RETURN TO INVENTORY
        </Link>
      </div>
    </div>
  );
}
