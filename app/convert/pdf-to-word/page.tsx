'use client';

import React from 'react';
import styles from './page.module.css';

export default function PdfToWord() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pdf-to-word-bg.jpg"
          alt="background"
          aria-hidden="true"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay}></div>
        
        <h1 className={styles.title}>PDF to Word</h1>
        <p className={styles.subtitle}>
          Convert your PDF documents to editable Microsoft Word files with professional-grade precision. Layouts, fonts, and tables are preserved perfectly.
        </p>
      </section>

      {/* Upload Card - Pulled up to overlap hero */}
      <div className={styles.uploadCardWrapper}>
        <div className={styles.uploadCard}>
          <div className={styles.iconCircle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <polyline points="9 15 12 12 15 15"></polyline>
            </svg>
          </div>
          <h2 className={styles.uploadTitle}>Drag & drop or click to browse</h2>
          <p className={styles.uploadDesc}>Supports PDF documents up to 50MB</p>
        </div>
      </div>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>Why use FileConvert?</h2>
        <div className={styles.featuresGrid}>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Flawless Formatting</h3>
            <p className={styles.featureDesc}>We use advanced OCR and layout analysis to ensure your fonts, tables, and spacing remain identical to the original PDF.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Enterprise Security</h3>
            <p className={styles.featureDesc}>Your files are encrypted during transit and automatically deleted from our servers 60 minutes after conversion.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h3 className={styles.featureTitle}>Cloud Processing</h3>
            <p className={styles.featureDesc}>Leverage our high-speed server clusters to convert massive documents in seconds, not minutes.</p>
          </div>

        </div>
      </section>
    </div>
  );
}
