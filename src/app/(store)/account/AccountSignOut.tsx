'use client';

import React from 'react';
import { signOut } from 'next-auth/react';

export function AccountSignOut() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/account/login' })}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: 'var(--tracking-wide)',
        color: 'var(--color-alert-red)',
        textTransform: 'uppercase',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--color-alert-red)',
        cursor: 'pointer',
        padding: '0 0 2px 0',
      }}
    >
      TERMINATE SESSION
    </button>
  );
}
