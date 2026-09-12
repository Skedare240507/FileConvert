'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

const allTools = [
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    desc: 'Convert Microsoft Word documents to professional PDF files with perfect formatting preservation. Supports .doc and .docx formats.',
    link: '/convert/word-to-pdf',
    featured: true,
    badge: 'Most Used',
    iconColor: 'iconFeatured',
    icon: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path>
      </svg>
    )
  },
  {
    id: 'word-to-ppt',
    title: 'Word to PPT',
    desc: 'Turn your document outlines into presentation slides automatically.',
    link: '/convert/word-to-ppt',
    featured: false,
    badge: null,
    iconColor: 'iconPPT',
    icon: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    )
  },
  {
    id: 'word-to-jpg',
    title: 'Word to JPG',
    desc: 'Export document pages as high-resolution image files for easy sharing.',
    link: '/convert/word-to-jpg',
    featured: false,
    badge: null,
    iconColor: 'iconJPG',
    icon: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    )
  },
  {
    id: 'merge-word',
    title: 'Merge Word',
    desc: 'Combine multiple Word files into a single master document seamlessly.',
    link: '/convert/merge',
    featured: false,
    badge: null,
    iconColor: 'iconMerge',
    icon: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M12 18v-6"></path><path d="M9 15h6"></path>
      </svg>
    )
  },
  {
    id: 'compress-word',
    title: 'Compress Word',
    desc: 'Reduce file size without losing formatting quality for easy emailing.',
    link: '/convert/compress-word',
    featured: false,
    badge: null,
    iconColor: 'iconCompress',
    icon: (size: number) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20"></polyline>
        <polyline points="20 10 14 10 14 4"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
        <line x1="3" y1="21" x2="14" y2="10"></line>
      </svg>
    )
  }
];

export default function WordTools() {
  const [query, setQuery] = useState('');

  const filtered = allTools.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.desc.toLowerCase().includes(query.toLowerCase())
  );

  const featured = filtered.find(t => t.featured);
  const rest = filtered.filter(t => !t.featured);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img suppressHydrationWarning
          src="/word-tools-bg.jpg"
          alt="Professional desk setup"
          aria-hidden="true"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroGradient}></div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>Productivity Essentials</div>
          <h1 className={styles.title}>Master Your Word Documents</h1>
          <p className={styles.subtitle}>
            Professional-grade tools to convert, edit, and optimize your Word files. Clean, fast, and secure.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btnPrimary}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Quick Upload
            </button>
            <button className={styles.btnSecondary} onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}>
              View All Tools
            </button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className={styles.toolsSection} id="tools-section">
        <div className={styles.toolsContainer}>
          <div className={styles.toolsHeader}>
            <div>
              <h2 className={styles.toolsTitle}>Available Word Tools</h2>
              <p className={styles.toolsSubtitle}>Select a utility to begin your document transformation.</p>
            </div>

            <div className={styles.searchBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Find a tool..."
                className={styles.searchInput}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--on-surface-variant)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p style={{ fontWeight: 600 }}>No tools found for &quot;{query}&quot;</p>
              <p style={{ fontSize: '14px', marginTop: 4 }}>Try a different search term.</p>
            </div>
          ) : (
            <div className={styles.toolsGrid}>

              {/* Featured card */}
              {featured && (
                <a href={featured.link} className={`${styles.toolCard} ${styles.toolCardFeatured}`}>
                  <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className={styles.featuredHeader}>
                      <div className={`${styles.toolIcon} ${styles.iconFeatured}`}>
                        {featured.icon(28)}
                      </div>
                      {featured.badge && <span className={styles.badgeFeatured}>{featured.badge}</span>}
                    </div>
                    <h3 className={styles.toolCardTitle}>{featured.title}</h3>
                    <p className={`${styles.toolCardDesc} ${styles.featuredDesc}`}>{featured.desc}</p>
                    <div className={styles.toolLink} style={{ marginTop: 'auto' }}>
                      Start Conversion
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                  {/* Decorative watermark */}
                  <svg className={styles.watermark} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                  </svg>
                </a>
              )}

              {/* Normal cards */}
              {rest.map(tool => (
                <a key={tool.id} href={tool.link} className={`${styles.toolCard} ${styles.toolCardNormal}`}>
                  <div className={`${styles.toolIcon} ${styles[tool.iconColor as keyof typeof styles]}`}>
                    {tool.icon(24)}
                  </div>
                  <h3 className={styles.toolCardTitle}>{tool.title}</h3>
                  <p className={styles.toolCardDesc}>{tool.desc}</p>
                  <div className={styles.toolLink}>
                    Start Conversion
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </a>
              ))}

            </div>
          )}
        </div>
      </section>
    </div>
  );
}
