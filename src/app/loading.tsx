export default function Loading() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-widest)', color: 'var(--color-mid-gray)', textTransform: 'uppercase' }}>
        Loading…
      </p>
    </div>
  );
}
