import Link from 'next/link';
import styles from './Footer.module.css';

const footerLinks = {
  company: [
    { href: '/about', label: 'Studio' },
    { href: '/press', label: 'Press' },
    { href: '/legal', label: 'Legal' },
  ],
  social: [
    { href: '#', label: 'Instagram' },
    { href: '#', label: 'Twitter' },
    { href: '#', label: 'LinkedIn' },
  ],
  contact: [
    { label: 'Suite 201' },
    { label: 'Brooklyn 11201' },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.inner} container`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.brandName}>Bloodline Editorial Design System</p>
            <p className={styles.copyright}>All rights reserved &amp; held.</p>
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
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Location</h4>
            <ul className={styles.list}>
              {footerLinks.contact.map((item) => (
                <li key={item.label} className={styles.footerLink}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
