import React from 'react';
import styles from './page.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { addresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import AddressClient from './AddressClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Addresses — MR Essentials' };

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/account/login');

  const userAddresses = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, session.user.id));

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/account">Account</Link>
        <span className={styles.sep}>/</span>
        <span>Addresses</span>
      </nav>

      <h1 className={styles.title}>ADDRESS BOOK</h1>

      <AddressClient initialAddresses={userAddresses} />
    </div>
  );
}
