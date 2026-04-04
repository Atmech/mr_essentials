import styles from './ColorSwatch.module.css';

interface ColorSwatchProps {
  name: string;
  hex: string;
  className?: string;
}

export default function ColorSwatch({ name, hex, className }: ColorSwatchProps) {
  const isLight = ['#FFFFFF', '#F5F5F5', '#E0E0E0'].includes(hex.toUpperCase());

  return (
    <div className={`${styles.swatch} ${className || ''}`}>
      <div
        className={styles.color}
        style={{ backgroundColor: hex }}
      >
        <span className={`${styles.name} ${isLight ? styles.dark : styles.light}`}>
          {name}
        </span>
      </div>
      <div className={styles.meta}>
        <span className={styles.hex}>{hex}</span>
      </div>
    </div>
  );
}
