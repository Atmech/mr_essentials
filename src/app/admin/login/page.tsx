'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-black)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: 'var(--space-10)',
        border: '2px solid var(--color-charcoal)',
        backgroundColor: 'var(--color-dark)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-widest)',
            color: 'var(--color-alert-red)',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-2)',
          }}>
            RESTRICTED ACCESS
          </p>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-white)',
            lineHeight: 1,
          }}>
            SYS_ADMIN
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-alert-red)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-6)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-widest)',
              color: 'var(--color-mid-gray)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-charcoal)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-white)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-charcoal)'}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-widest)',
              color: 'var(--color-mid-gray)',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-charcoal)',
                color: 'var(--color-white)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-white)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-charcoal)'}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 'var(--space-2)',
              width: '100%',
              padding: 'var(--space-4)',
              backgroundColor: loading ? 'var(--color-charcoal)' : 'var(--color-white)',
              color: 'var(--color-black)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-base)',
              letterSpacing: 'var(--tracking-widest)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color var(--duration-fast)',
            }}
          >
            {loading ? 'VERIFYING...' : 'ENTER SYSTEM'}
          </button>
        </form>
      </div>
    </div>
  );
}
