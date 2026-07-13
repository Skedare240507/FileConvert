'use client';

import React from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export default function PdfToolsPage() {
  return (
    <div className={styles.container}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroTitleBox}>
            <h1 className={styles.heroTitle}>Professional PDF Utilities</h1>
          </div>
          
          <p className={styles.heroDesc}>
            The premium suite for document management. Efficient, secure, and built for professionals who demand digital precision.
          </p>
          
          <div className={styles.heroBadges}>
            <div className={styles.badge}>
              <span className="material-symbols-outlined">verified_user</span> 
              <span>SOC2 Compliant</span>
            </div>
            <div className={styles.badge}>
              <span className="material-symbols-outlined">bolt</span> 
              <span>Real-time Processing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Utilities Grid */}
      <section className={styles.gridSection}>
        <div className={styles.toolsGrid}>
          {/* Word to PDF */}
          <Link href="/convert/word-to-pdf" className={styles.toolCard}>
            <div className={`${styles.iconWrap} ${styles.bgPrimary}`}>
              <span className="material-symbols-outlined">description</span>
            </div>
            <h3 className={styles.toolTitle}>Word to PDF</h3>
            <p className={styles.toolDesc}>Convert DOCX files with perfect formatting preservation.</p>
            <span className={styles.toolLink}>
              Start Conversion <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </Link>

          {/* Merge PDF */}
          <Link href="/convert/merge" className={styles.toolCard}>
            <div className={`${styles.iconWrap} ${styles.bgSecondary}`}>
              <span className="material-symbols-outlined">call_merge</span>
            </div>
            <h3 className={styles.toolTitle}>Merge PDF</h3>
            <p className={styles.toolDesc}>Combine multiple documents into one polished file.</p>
            <span className={styles.toolLink}>
              Start Conversion <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </Link>

          {/* PDF to JPG */}
          <Link href="/convert/pdf-to-jpg" className={styles.toolCard}>
            <div className={`${styles.iconWrap} ${styles.bgTertiary}`}>
              <span className="material-symbols-outlined">image</span>
            </div>
            <h3 className={styles.toolTitle}>PDF to JPG</h3>
            <p className={styles.toolDesc}>Extract high-resolution images from any document.</p>
            <span className={styles.toolLink}>
              Start Conversion <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </Link>

          {/* PDF to PPT */}
          <Link href="/convert/pdf-to-ppt" className={styles.toolCard}>
            <div className={`${styles.iconWrap} ${styles.bgError}`}>
              <span className="material-symbols-outlined">present_to_all</span>
            </div>
            <h3 className={styles.toolTitle}>PDF to PPT</h3>
            <p className={styles.toolDesc}>Turn static reports into editable presentations.</p>
            <span className={styles.toolLink}>
              Start Conversion <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Why Professionals Choose Us */}
      <section className={styles.whySection}>
        <div className={styles.whyBg}>
          <img 
            className={styles.whyBgImg} 
            src="https://lh3.googleusercontent.com/aida/AP1WRLsR6dQrgcoqAMXTEItvmKi1X8eZ8yf6pbtdLMVGLlELrWCqdAWPgUIOvP_uZPSU9RmlQmWWi1IlD8-hwERzuR2-Z0vaEdoXEdJCy9EjyBPhS7OR6D661iMPEYkMs0hvaaH-mBQq3kP9LYIum64N8LC4FgSDaBycrCC_OWh_tD3Ckyb9MdEdJgZ5leVHRVFqdK-WqZ5Xr_5WbAUcnqK5lsWu-j1Yv1quUMgUmG67U05f2AHoA7MFQ8tV" 
            alt="Abstract Background" 
          />
          <div className={styles.whyBgOverlay}></div>
        </div>
        
        <div className={styles.whyContent}>
          <h2 className={styles.whyTitle}>Why Professionals Choose FileConvert</h2>
          <div className={styles.whyGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrap}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>high_quality</span>
              </div>
              <h4 className={styles.featureTitle}>Lossless Quality</h4>
              <p className={styles.featureDesc}>Advanced rendering engines ensure every vector and pixel remains sharp through every conversion.</p>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrap}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>security</span>
              </div>
              <h4 className={styles.featureTitle}>Enterprise Security</h4>
              <p className={styles.featureDesc}>Your files are encrypted with AES-256 and automatically deleted after 2 hours. Privacy is our policy.</p>
            </div>
            
            <div className={styles.featureItem}>
              <div className={styles.featureIconWrap}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>speed</span>
              </div>
              <h4 className={styles.featureTitle}>Faster Processing</h4>
              <p className={styles.featureDesc}>Distributed cloud infrastructure processes even massive documents in seconds, not minutes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
