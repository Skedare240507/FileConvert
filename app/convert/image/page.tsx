'use client';

import React from 'react';
import styles from './page.module.css';

export default function ImageTools() {
  const tools = [
    {
      title: 'JPG to PDF',
      desc: 'Convert multiple JPG images into a single professional PDF document in seconds.',
      link: '/convert/jpg-to-pdf',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <rect x="8" y="12" width="8" height="6" rx="1"></rect>
          <path d="M10 18v-6"></path>
        </svg>
      )
    },
    {
      title: 'JPG to PPT',
      desc: 'Transform your photo collections into editable PowerPoint presentations effortlessly.',
      link: '/convert/jpg-to-ppt',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <polygon points="8 21 16 21 12 17 8 21"></polygon>
        </svg>
      )
    },
    {
      title: 'Convert to JPG',
      desc: 'Convert HEIC, PNG, TIFF, or BMP files to high-quality JPG format for universal compatibility.',
      link: '/convert/to-jpg',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      )
    }
  ];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image-tools-bg.jpg"
          alt="Image transformation background"
          aria-hidden="true"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={styles.heroContent}>
          <div className={styles.badge}>PREMIUM UTILITY</div>
          <h1 className={styles.title}>Professional Image<br/>Transformation.</h1>
          <p className={styles.subtitle}>
            Optimize, convert, and resize your visual assets with our high-end suite of image tools. Fast, secure, and built for professionals who demand quality.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.btnPrimary}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Select Files
            </button>
            <button className={styles.btnSecondary}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className={styles.toolsSection}>
        <div className={styles.toolsContainer}>
          <div className={styles.toolsHeader}>
            <div>
              <h2 className={styles.toolsTitle}>Popular Tools</h2>
              <p className={styles.toolsSubtitle}>Our most frequently used image processing utilities</p>
            </div>
            <a href="#all" className={styles.viewAll}>View All Tools →</a>
          </div>
          
          <div className={styles.toolsGrid}>
            {tools.map((tool, i) => (
              <a key={i} href={tool.link} className={styles.toolCard}>
                <div className={styles.toolIcon}>{tool.icon}</div>
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
        </div>
      </section>

      {/* Why Professionals Choose Us Section */}
      <section className={styles.whySection}>
        <div className={styles.whyContainer}>
          <div className={styles.whyImageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hero-bg.jpg" alt="Office tools" className={styles.whyImage} />
            <div className={styles.testimonial}>
              <p className={styles.testimonialText}>
                &quot;FileConvert has streamlined our social media workflow significantly. The batch processing is unmatched.&quot;
              </p>
              <div className={styles.author}>
                <div className={styles.authorAvatar}></div>
                <div>
                  <div className={styles.authorName}>Sarah Jenkins</div>
                  <div className={styles.authorRole}>Creative Director at Zenith Agency</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className={styles.whyTitle}>Why Professionals<br/>Choose FileConvert</h2>
            
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureItemIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.featureItemTitle}>Lossless Quality</h3>
                  <p className={styles.featureItemDesc}>Our algorithms preserve every pixel, ensuring your images look perfect after every conversion.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureItemIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0"></path>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.featureItemTitle}>Privacy First</h3>
                  <p className={styles.featureItemDesc}>Files are automatically deleted from our secure servers after 60 minutes. Your data is your own.</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureItemIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.featureItemTitle}>Cloud Speed</h3>
                  <p className={styles.featureItemDesc}>Process gigabytes of image data in seconds using our global high-speed edge network.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
