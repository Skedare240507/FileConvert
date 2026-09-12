'use client';

import React from 'react';
import styles from './page.module.css';

const tools = [
  {
    title: 'PPT to Word',
    desc: 'Convert your presentation slides into editable Word documents while preserving text layout and structure. Perfect for creating meeting handouts.',
    link: '/convert/ppt-to-word',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    ),
    cta: 'Start Conversion'
  },
  {
    title: 'PPT to PDF',
    desc: 'High-quality PDF generation from PowerPoint files. Maintains all transitions, fonts, and high-resolution graphics for professional sharing.',
    link: '/convert/ppt-to-pdf',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <rect x="8" y="12" width="8" height="5" rx="1"></rect>
      </svg>
    ),
    cta: 'Start Conversion'
  },
  {
    title: 'PPT to JPG',
    desc: 'Turn your PowerPoint slides into high-quality images. Maintain crisp resolution and perfect layout consistency.',
    link: '/convert/ppt-to-jpg',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    ),
    cta: 'Start Conversion'
  },
  {
    title: 'Merge PPT',
    desc: 'Combine multiple PowerPoint presentations into a single cohesive file seamlessly.',
    link: '/merge',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    ),
    cta: 'Start Merging'
  }
];

export default function PptTools() {
  return (
    <div className={styles.container}>

      {/* Hero */}
      <section
        className={styles.hero}
        style={{ backgroundImage: "url('/ppt-bg.jpg')" }}
      >
        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Professional PowerPoint<br />Tools</h1>
          <p className={styles.heroSubtitle}>
            Streamline your presentation workflow with our premium conversion utilities. High-fidelity results, lightning-fast processing, and secure file handling for the modern professional.
          </p>
          <button
            className={styles.heroBtn}
            onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore All Tools
          </button>
        </div>
      </section>

      {/* Tools Grid */}
      <section className={styles.toolsSection} id="tools">
        <div className={styles.toolsContainer}>
          <h2 className={styles.toolsTitle}>Available PowerPoint Utilities</h2>
          <p className={styles.toolsSubtitle}>Selected tools for optimized document conversion.</p>

          <div className={styles.toolsGrid}>
            {tools.map((tool, i) => (
              <a key={i} href={tool.link} className={styles.toolCard}>
                <div className={styles.toolIcon}>{tool.icon}</div>
                <h3 className={styles.toolCardTitle}>{tool.title}</h3>
                <p className={styles.toolCardDesc}>{tool.desc}</p>
                <div className={styles.toolLink}>
                  {tool.cta}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
