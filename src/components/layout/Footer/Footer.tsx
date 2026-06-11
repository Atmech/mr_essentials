import Link from 'next/link';
import styles from './Footer.module.css';

const footerLinks = {
  shop: [
    { href: '/shop', label: 'Shop All' },
    { href: '/shop?category=hoodies', label: 'Hoodies' },
    { href: '/shop?category=tees', label: 'Tees' },
    { href: '/shop?category=shorts', label: 'Shorts' },
    { href: '/shop?category=pants', label: 'Pants' },
    { href: '/shop?category=tracksuits', label: 'Tracksuits' },
    { href: '/shop?category=jackets', label: 'Jackets' },
    { href: '/shop?category=accessories', label: 'Accessories' },
  ],
  company: [
    { href: '/ethos', label: 'Our Ethos' },
    { href: '/lookbook', label: 'Lookbook' },
    { href: '/shipping', label: 'Shipping & Returns' },
    { href: '/account', label: 'My Account' },
  ],
  social: [
    { href: '#', label: 'Instagram' },
    { href: '#', label: 'Twitter' },
    { href: '#', label: 'TikTok' },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.brandName}>MR ESSENTIALS</p>
            <p className={styles.copyright}>© {new Date().getFullYear()} MR Essentials. All rights reserved.</p>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Shop</h4>
            <ul className={styles.list}>
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Company</h4>
            <ul className={styles.list}>
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Social</h4>
            <ul className={styles.list}>
              {footerLinks.social.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
