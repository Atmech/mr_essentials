'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User, Heart } from 'lucide-react';
import styles from './Navbar.module.css';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useUIStore } from '@/lib/store/ui';

const navLinks = [
  { href: '/shop?category=hoodies', label: 'Hoodies' },
  { href: '/shop?category=trackpants', label: 'Trackpants' },
  { href: '/shop?category=tracksuits', label: 'Tracksuits' },
  { href: '/shop?category=jackets', label: 'Jackets' },
  { href: '/shop', label: 'Shop All' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const openSearch = useUIStore((s) => s.openSearch);

  return (
    <header className={styles.header}>
      <div className={styles.topBanner}>
        MID-SEASON DROP | EVERYTHING MUST GO | SHOP THE NEW DROP
      </div>
      <nav className={`${styles.nav} container`}>
        <Link href="/" className={styles.logo} aria-label="MR Essentials Home">
          <Image 
            src="/logo.jpeg" 
            alt="MR Essentials" 
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>

        <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.link}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link href="/account" className={styles.actionButton} aria-label="Account">
            <User size={20} />
          </Link>
          <button className={styles.actionButton} aria-label="Search" onClick={openSearch}>
            <Search size={20} />
          </button>
          <Link href="/account/wishlist" className={styles.actionButton} aria-label="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </Link>
          <button className={styles.actionButton} aria-label="Cart" onClick={openCart}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </button>
          <button
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  );
}
