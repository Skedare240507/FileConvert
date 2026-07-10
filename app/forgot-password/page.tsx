'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function ForgotPassword() {
  return (
    <div className={styles.container}>
      {/* Background Image layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwmbbL1NCzyoIGz44uBM0_1r2aHZCdtLOqMiV4ZkhhcsR7b2wXOpaQH6Q21iI9ivOAaOzU-zgn8EezkVT1HMCxvmWgLS_W2Itf8i87boH0HQjQ_nRxfI3fdNLLf06njAWtZyr11gd-Q3P539NaAvLyfN-EKjDPTdVbn_CuqVdtDRXtr8pw6A4pERa3J65ZUfmHDWVDe1c0k-OyjnRq4Hl3X86i2SdO5OpDTi51OFP85r23IrXQJc-nF5oJz0awWXPe0qRY8HNQbA"
        alt="Background"
        aria-hidden="true"
        className={styles.bgImg}
      />
      <div className={styles.overlay}></div>

      {/* Authentication Card */}
      <div className={styles.card}>
        {/* Branding & Title */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
              lock_reset
            </span>
          </div>
          <h1 className={styles.title}>Forgot Password?</h1>
          <p className={styles.subtitle}>
            No worries, it happens. Enter the email associated with your account and we'll send you reset instructions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); alert('Reset link sent to your email!'); }}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`} aria-hidden="true">
                mail
              </span>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                className={styles.input}
                required
              />
            </div>
          </div>
          
          <button type="submit" className={styles.submitBtn}>
            Reset Password
          </button>
        </form>

        {/* Footer Link */}
        <div className={styles.footerLinkContainer}>
          <Link href="/login" className={styles.backLink}>
            <span className={`material-symbols-outlined ${styles.backLinkIcon}`} aria-hidden="true">
              arrow_back
            </span>
            Back to Login
          </Link>
        </div>

        {/* Contextual Help */}
        <p className={styles.helpText}>
          Need more help? <Link href="/help">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
