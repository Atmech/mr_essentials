'use client';

import { useRouter } from 'next/navigation';

export function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        width: "100%",
        padding: "var(--space-3) var(--space-4)",
        backgroundColor: "transparent",
        border: "1px solid var(--color-charcoal)",
        color: "var(--color-mid-gray)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      Logout
    </button>
  );
}
