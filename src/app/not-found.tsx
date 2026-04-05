import Link from 'next/link';
import Button from '@/components/ui/Button/Button';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-10) var(--gutter)',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(6rem, 15vw, 12rem)',
        lineHeight: 0.85,
        color: 'var(--color-light-gray)',
        marginBottom: 'var(--space-4)',
      }}>
        404
      </h1>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-lg)',
        color: 'var(--color-charcoal)',
        marginBottom: 'var(--space-2)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        PAGE NOT FOUND
      </p>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-mid-gray)',
        marginBottom: 'var(--space-8)',
      }}>
        The requested resource does not exist in this registry.
      </p>
      <Link href="/">
        <Button variant="primary">RETURN HOME</Button>
      </Link>
    </div>
  );
}
