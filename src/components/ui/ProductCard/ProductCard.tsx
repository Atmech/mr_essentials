import Image from 'next/image';
import styles from './ProductCard.module.css';
import Badge from '../Badge/Badge';

interface ProductCardProps {
  badge?: string;
  badgeVariant?: 'default' | 'alert';
  image: string;
  title: string;
  description: string;
  price: string;
  /** When set, `price` is shown as the sale price and this is struck through. */
  originalPrice?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export default function ProductCard({
  badge,
  badgeVariant = 'alert',
  image,
  title,
  description,
  price,
  originalPrice,
}: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {badge && (
          <div className={styles.badgeWrap}>
            <Badge variant={badgeVariant}>{badge}</Badge>
          </div>
        )}
        <Image
          src={image}
          alt={title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          {originalPrice ? (
            <span className={styles.price}>
              <span className={styles.salePrice}>{price}</span>{' '}
              <s className={styles.originalPrice}>{originalPrice}</s>
            </span>
          ) : (
            <span className={styles.price}>{price}</span>
          )}
        </div>
      </div>
    </article>
  );
}
