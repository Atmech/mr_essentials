import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'alert';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className || ''}`}>
      {children}
    </span>
  );
}
