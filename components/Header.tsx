"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '../app/layout.module.css';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          {/* Logo */}
          <div className={styles.logo}>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="FileConvert Logo"
                width={48}
                height={48}
                style={{ borderRadius: '8px', objectFit: 'contain', display: 'block', marginRight: '10px' }}
              />
              FileConvert
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            <Link href="/convert/pdf">PDF Tools</Link>
            <Link href="/convert/image">Image Tools</Link>
            <Link href="/convert/spreadsheet">Spreadsheet Tools</Link>
            <Link href="/convert/word">Word Tools</Link>
            <Link href="/convert/ppt">PPT</Link>
            <Link href="/convert/merge">Merge</Link>
          </nav>

          {/* Desktop Actions */}
          <div className={styles.actions}>
            <Link href="/help" className={styles.helpIcon} aria-label="Help">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </Link>
            <Link href="/login" className={styles.loginText}>Login</Link>
            <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
          </div>

          {/* Hamburger (Mobile) */}
          <button
            className={styles.hamburgerBtn}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.open : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <button
          className={styles.sidebarCloseBtn}
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        {/* Sidebar Logo */}
        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--surface-variant)' }}>
          <Link href="/" onClick={() => setIsSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '18px', color: 'var(--primary)', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FileConvert" width={28} height={28} style={{ borderRadius: '6px', objectFit: 'contain' }} />
            FileConvert
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/convert/pdf" onClick={() => setIsSidebarOpen(false)}>PDF Tools</Link>
          <Link href="/convert/image" onClick={() => setIsSidebarOpen(false)}>Image Tools</Link>
          <Link href="/convert/spreadsheet" onClick={() => setIsSidebarOpen(false)}>Spreadsheet Tools</Link>
          <Link href="/convert/word" onClick={() => setIsSidebarOpen(false)}>Word Tools</Link>
          <Link href="/convert/ppt" onClick={() => setIsSidebarOpen(false)}>PPT Tools</Link>
          <Link href="/convert/merge" onClick={() => setIsSidebarOpen(false)}>Merge</Link>
          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--surface-variant)' }} />
          <Link href="/help" onClick={() => setIsSidebarOpen(false)}>Support / Help</Link>
          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--surface-variant)' }} />
          <Link href="/login" onClick={() => setIsSidebarOpen(false)}>Login</Link>
          <Link href="/signup" onClick={() => setIsSidebarOpen(false)} style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up →</Link>
        </nav>
      </div>
    </>
  );
}
