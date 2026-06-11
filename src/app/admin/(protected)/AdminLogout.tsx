'use client';

import { signOut } from 'next-auth/react';

export function AdminLogout() {
  const handleLogout = () => signOut({ callbackUrl: '/' });

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
