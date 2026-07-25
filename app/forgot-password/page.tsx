'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../login/page.module.css';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'reset_password' })
      });
      
      if (res.status === 429) {
        const data = await res.json();
        throw new Error(data.message);
      }

      // Always show success (anti-enumeration)
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/login-bg.jpg" alt="background" aria-hidden="true" className={styles.bgImg} />
      <div className={styles.overlay}></div>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FileConvert Logo" width={36} height={36} style={{ borderRadius: '6px', objectFit: 'contain' }} />
            FileConvert
          </div>
          <div className={styles.subtitle}>Forgot your password?</div>
        </div>

        {error && (
          <div style={{ color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', background: '#ff4d4f20', padding: '0.5rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            {/* Email icon */}
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📬</div>
            <h3 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Check your inbox!</h3>
            <p style={{ color: '#8b8d98', fontSize: '0.9rem', lineHeight: '1.5' }}>
              If <strong style={{ color: '#7c6ef5' }}>{email}</strong> is registered, we've sent a secure password reset link. It expires in 60 minutes.
            </p>
            <p style={{ color: '#8b8d98', fontSize: '0.82rem', marginTop: '1rem' }}>
              Didn't get it? Check your spam folder.
            </p>
            <button
              type="button"
              onClick={() => { setSubmitted(false); setEmail(''); }}
              style={{ marginTop: '1.5rem', background: 'transparent', color: '#7c6ef5', border: '1px solid #7c6ef5', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontSize: '0.9rem', width: '100%' }}
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendLink}>
            <p style={{ color: '#8b8d98', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              Enter your email and we'll send you a secure link to reset your password.
            </p>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Email Address</label>
              </div>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className={styles.input}
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              style={{ marginTop: '1rem', width: '100%', background: 'transparent', color: '#8b8d98', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
