import Image from 'next/image';
import styles from './ProductCard.module.css';
import Badge from '../Badge/Badge';
import Button from '../Button/Button';

interface ProductCardProps {
  badge?: string;
  badgeVariant?: 'default' | 'alert';
  image: string;
  title: string;
  description: string;
  price: string;
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
  ctaLabel = 'Add to Cart',
  onCtaClick,
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
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.price}>{price}</span>
          </div>
          <Button variant="primary" size="sm" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
