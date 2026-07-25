'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../login/page.module.css';

function getPasswordStrength(password: string): { score: number; label: string; color: string; checks: Record<string, boolean> } {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  let label = 'Very Weak'; let color = '#ff4d4f';
  if (score === 2) { label = 'Weak'; color = '#ff7a45'; }
  else if (score === 3) { label = 'Fair'; color = '#ffa940'; }
  else if (score === 4) { label = 'Good'; color = '#bae637'; }
  else if (score === 5) { label = 'Strong'; color = '#52c41a'; }
  return { score, label, color, checks };
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const isPasswordStrong = passwordStrength.score === 5;

  useEffect(() => {
    if (!token || !email) {
      setError('This reset link is invalid or missing required information. Please request a new one.');
    }
  }, [token, email]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) return setError("Please choose a strong password.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: newPassword, token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
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
          <div className={styles.subtitle}>Set a new password</div>
        </div>

        {error && <div style={{ color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', background: '#ff4d4f20', padding: '0.75rem', borderRadius: '4px' }}>{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: '#52c41a', marginBottom: '0.5rem' }}>Password Reset!</h3>
            <p style={{ color: '#8b8d98', fontSize: '0.9rem' }}>Your password has been updated. Redirecting to login...</p>
          </div>
        ) : (
          !error && (
            <form onSubmit={handleReset}>
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>New Password</label>
                </div>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0"></path>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={styles.input}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" className={styles.inputAction} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle visibility">
                    {showPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    }
                  </button>
                </div>

                {/* Strength Meter */}
                {newPassword.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= passwordStrength.score ? passwordStrength.color : '#2a2d3a', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.78rem', color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.label}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        {[
                          { key: 'minLength', label: '8+ characters' },
                          { key: 'hasUppercase', label: 'Uppercase (A-Z)' },
                          { key: 'hasLowercase', label: 'Lowercase (a-z)' },
                          { key: 'hasNumber', label: 'Number (0-9)' },
                          { key: 'hasSpecial', label: 'Special (@$!%*?&)' },
                        ].map(({ key, label }) => (
                          <span key={key} style={{ fontSize: '0.72rem', color: passwordStrength.checks[key] ? '#52c41a' : '#8b8d98' }}>
                            {passwordStrength.checks[key] ? '✓' : '✗'} {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Confirm Password</label>
                </div>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0"></path>
                    </svg>
                  </div>
                  <input type="password" placeholder="••••••••" className={styles.input} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                {confirmPassword.length > 0 && (
                  <div style={{ marginTop: '6px', fontSize: '0.78rem', color: newPassword === confirmPassword ? '#52c41a' : '#ff4d4f' }}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={styles.loginBtn}
                disabled={loading || !isPasswordStrong}
                style={{ opacity: !isPasswordStrong ? 0.6 : 1, cursor: !isPasswordStrong ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )
        )}

        {error && (
          <button type="button" onClick={() => router.push('/forgot-password')} className={styles.loginBtn} style={{ marginTop: '1rem' }}>
            Request a new link
          </button>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '4rem' }}>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
