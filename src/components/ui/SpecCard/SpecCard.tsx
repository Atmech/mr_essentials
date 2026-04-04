import styles from './SpecCard.module.css';

interface SpecRow {
  label: string;
  value: string;
}

interface SpecCardProps {
  number?: string;
  title: string;
  description?: string;
  specs: SpecRow[];
  className?: string;
}

export default function SpecCard({ number, title, description, specs, className }: SpecCardProps) {
  return (
    <article className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        {number && <span className={styles.number}>{number}</span>}
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.specList}>
        {specs.map((spec) => (
          <div key={spec.label} className={styles.specRow}>
            <span className={styles.specLabel}>{spec.label}</span>
            <span className={styles.specValue}>{spec.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
