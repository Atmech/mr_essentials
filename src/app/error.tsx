'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', padding: 'var(--space-10)', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)' }}>SOMETHING BROKE</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-mid-gray)' }}>
        An unexpected error occurred. Try again.
      </p>
      <button
        onClick={reset}
        style={{ padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-black)', color: 'var(--color-white)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', cursor: 'pointer' }}
      >
        Retry
      </button>
    </div>
  );
}
