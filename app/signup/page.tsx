'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from './page.module.css';

// Password strength logic
function getPasswordStrength(password: string): { score: number; label: string; color: string; checks: Record<string, boolean> } {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  let label = 'Very Weak';
  let color = '#ff4d4f';
  if (score === 2) { label = 'Weak'; color = '#ff7a45'; }
  else if (score === 3) { label = 'Fair'; color = '#ffa940'; }
  else if (score === 4) { label = 'Good'; color = '#bae637'; }
  else if (score === 5) { label = 'Strong'; color = '#52c41a'; }
  return { score, label, color, checks };
}

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for OTP (10 minutes = 600 seconds)
  const OTP_EXPIRY_SECS = 180;
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setSecondsLeft(OTP_EXPIRY_SECS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const isPasswordStrong = passwordStrength.score === 5;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!isPasswordStrong) {
      return setError("Please choose a strong password before continuing.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'signup' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      setMessage("OTP sent to your email!");
      startTimer();
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, otpCode })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Auto login
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      router.push('/profile');
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
          <div className={styles.subtitle}>Premium Document Utility</div>
        </div>

        {error && <div style={{ color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', background: '#ff4d4f20', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
        {message && <div style={{ color: '#52c41a', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', background: '#52c41a20', padding: '0.5rem', borderRadius: '4px' }}>{message}</div>}

        {step === 1 ? (
          <>
            <button type="button" className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/profile' })}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>

            <div className={styles.divider}>OR SIGN UP WITH EMAIL</div>

            <form onSubmit={handleSendOtp}>
              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Full Name</label>
                </div>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <input type="text" placeholder="John Doe" className={styles.input} required value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>

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
                  <input type="email" placeholder="name@company.com" className={styles.input} required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
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
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className={styles.inputAction} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: i <= passwordStrength.score ? passwordStrength.color : '#2a2d3a',
                          transition: 'background 0.3s ease'
                        }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.78rem', color: passwordStrength.color, fontWeight: 600, transition: 'color 0.3s' }}>
                        {passwordStrength.label}
                      </span>
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
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className={styles.input} 
                    required 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" className={styles.inputAction} onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle password visibility">
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div style={{ marginTop: '6px', fontSize: '0.78rem', color: password === confirmPassword ? '#52c41a' : '#ff4d4f' }}>
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={styles.loginBtn} 
                disabled={loading || !isPasswordStrong}
                style={{ opacity: !isPasswordStrong ? 0.6 : 1, cursor: !isPasswordStrong ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleRegister}>
            {/* Countdown timer */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <p style={{ color: '#8b8d98', fontSize: '0.85rem', marginBottom: '6px' }}>
                Code sent to <strong style={{ color: '#7c6ef5' }}>{email}</strong>
              </p>
              {secondsLeft > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: secondsLeft <= 60 ? '#ff4d4f15' : '#7c6ef515', border: `1px solid ${secondsLeft <= 60 ? '#ff4d4f50' : '#7c6ef550'}`, borderRadius: '20px', padding: '6px 16px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={secondsLeft <= 60 ? '#ff4d4f' : '#7c6ef5'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: secondsLeft <= 60 ? '#ff4d4f' : '#7c6ef5', fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(secondsLeft)}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#8b8d98' }}>remaining</span>
                </div>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ff4d4f15', border: '1px solid #ff4d4f50', borderRadius: '20px', padding: '6px 16px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#ff4d4f' }}>⚠ OTP expired — </span>
                  <button type="button" onClick={() => { setStep(1); setOtpCode(''); setError(''); }} style={{ background: 'none', border: 'none', color: '#7c6ef5', cursor: 'pointer', fontSize: '0.85rem', padding: 0, textDecoration: 'underline' }}>resend</button>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>6-digit OTP</label>
              </div>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10.06 10.06 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className={styles.input}
                  required
                  disabled={secondsLeft === 0}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
            <button type="submit" className={styles.loginBtn} disabled={loading || secondsLeft === 0}>{loading ? 'Verifying...' : 'Verify & Register'}</button>
            <button type="button" onClick={() => { setStep(1); setOtpCode(''); setError(''); }} style={{ marginTop: '1rem', width: '100%', background: 'transparent', color: '#8b8d98', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>← Back</button>
          </form>
        )}

        <div className={styles.terms}>
          By continuing, you agree to FileConvert's<br/>
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}
