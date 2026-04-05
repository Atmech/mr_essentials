import React from 'react';
import styles from './page.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Profile — MR Essentials' };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/account/login');

  const user = session.user;

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/account">Account</Link>
        <span className={styles.sep}>/</span>
        <span>Profile</span>
      </nav>

      <h1 className={styles.title}>PROFILE</h1>

      <div className={styles.profileCard}>
        <div className={styles.avatarWrap}>
          {user.image ? (
            <Image src={user.image} alt={user.name || 'Avatar'} width={80} height={80} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {(user.name || user.email || '?')[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>NAME</span>
            <span className={styles.fieldValue}>{user.name || '—'}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>EMAIL</span>
            <span className={styles.fieldValue}>{user.email}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>SIGN-IN METHOD</span>
            <span className={styles.fieldValue}>Google SSO</span>
          </div>
        </div>

        <p className={styles.notice}>
          Profile details are managed by your Google account. To update your name or photo, visit your Google Account settings.
        </p>
      </div>
    </div>
  );
}
