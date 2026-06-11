import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { orders, wishlists } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import { AccountSignOut } from './AccountSignOut';
import { Package, Heart, MapPin, UserCircle, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Account — MR Essentials',
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/account/login');
  }

  const [orderCount] = await db.select({ value: count() }).from(orders).where(eq(orders.userId, session.user.id));
  const [wishlistCount] = await db.select({ value: count() }).from(wishlists).where(eq(wishlists.userId, session.user.id));

  const accountSections = [
    {
      href: '/account/orders',
      icon: <Package size={24} />,
      title: 'ORDER HISTORY',
      desc: `${orderCount?.value || 0} orders placed`,
    },
    {
      href: '/account/wishlist',
      icon: <Heart size={24} />,
      title: 'WISHLIST',
      desc: `${wishlistCount?.value || 0} saved items`,
    },
    {
      href: '/account/addresses',
      icon: <MapPin size={24} />,
      title: 'ADDRESS BOOK',
      desc: 'Manage shipping addresses',
    },
    {
      href: '/account/profile',
      icon: <UserCircle size={24} />,
      title: 'PROFILE',
      desc: 'Edit your details',
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>MY ACCOUNT</h1>
          <p className={styles.subtitle}>
            {session.user.name?.toUpperCase() || session.user.email}
          </p>
        </div>
        <AccountSignOut />
      </header>

      <div className={styles.grid}>
        {accountSections.map((section) => (
          <Link key={section.href} href={section.href} className={styles.card}>
            <div className={styles.cardIcon}>{section.icon}</div>
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{section.title}</h2>
              <p className={styles.cardDesc}>{section.desc}</p>
            </div>
            <ChevronRight size={20} className={styles.cardArrow} />
          </Link>
        ))}
      </div>
    </div>
  );
}
