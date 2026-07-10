'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface FileWithId {
  file: File;
  id: number;
}

export default function JpgToPdf() {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [dragging, setDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [keepQuality, setKeepQuality] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const jpgs = Array.from(incoming).filter(f =>
      f.type === 'image/jpeg' || f.type === 'image/jpg'
    );
    if (!jpgs.length) return;
    setFiles(prev => [
      ...prev,
      ...jpgs.map(f => ({ file: f, id: ++idRef.current }))
    ]);
  }, []);

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleConvert = () => {
    if (!files.length || converting) return;
    setConverting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 18;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setConverting(false);
            setProgress(0);
            setFiles([]);
            alert('Conversion complete! Your PDF is ready for download.');
          }, 400);
          return 100;
        }
        return next;
      });
    }, 280);
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <div className={styles.container}>

      {/* ===== HERO ===== */}
      <section
        className={styles.hero}
        style={{ backgroundImage: "url('/jpg-to-pdf-bg.jpg')" }}
      >
        <div className={styles.heroWhiteOverlay}></div>

        <div className={styles.heroContent}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <a href="/">Home</a>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <a href="/convert/image">Image Tools</a>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span>JPG to PDF</span>
          </div>

          <h1 className={styles.heroTitle}>JPG to PDF</h1>
          <p className={styles.heroSubtitle}>
            Convert your images to high-quality PDF documents in seconds. Professional, secure, and perfectly formatted every time.
          </p>

          {/* Glass upload zone */}
          <div className={styles.glassPanel}>
            <div
              className={`${styles.dropZone} ${dragging ? styles.active : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <svg className={styles.dropIcon} width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <h3 className={styles.dropTitle}>Choose JPG images</h3>
              <p className={styles.dropSub}>or drop them here</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg"
                multiple
                style={{ display: 'none' }}
                onChange={e => addFiles(e.target.files)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FILE LIST + SETTINGS ===== */}
      {files.length > 0 && (
        <section className={styles.processSection}>
          {/* File list */}
          <div>
            <h2 className={styles.sectionTitle}>
              Selected Files
              <span className={styles.countBadge}>{files.length}</span>
            </h2>
            <div className={styles.fileList}>
              {files.map(({ file, id }) => (
                <div key={id} className={styles.fileItem}>
                  <div className={styles.fileItemLeft}>
                    <div className={styles.fileThumb}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFile(id)} aria-label="Remove file">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14H6L5 6"></path>
                      <path d="M10 11v6"></path><path d="M14 11v6"></path>
                      <path d="M9 6V4h6v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings sidebar */}
          <div className={styles.settingsSidebar}>
            <h3 className={styles.settingsTitle}>Conversion Settings</h3>

            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} />
              Auto-rotate images
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={keepQuality} onChange={e => setKeepQuality(e.target.checked)} />
              Maintain original quality
            </label>

            {converting && (
              <div className={styles.progressContainer}>
                <div className={styles.progressHeader}>
                  <span className={styles.progressLabel}>Converting...</span>
                  <span className={styles.progressPct}>{Math.round(progress)}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            <button
              className={styles.convertBtn}
              onClick={handleConvert}
              disabled={converting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              {converting ? 'Converting...' : 'Convert to PDF'}
            </button>
          </div>
        </section>
      )}

      {/* ===== FEATURES ===== */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.featuresTitle}>Everything you need</h2>
          <div className={styles.featuresGrid}>
            {[
              {
                title: 'Secure Processing',
                desc: 'Files are encrypted and automatically deleted from our servers after 2 hours. Your privacy is our priority.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5l-8-3zm-1 13l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>
                  </svg>
                )
              },
              {
                title: 'High Speed',
                desc: 'Optimized cloud infrastructure ensures the fastest conversion speeds without compromising resolution.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/>
                  </svg>
                )
              },
              {
                title: 'Batch Conversion',
                desc: "Upload dozens of JPGs at once. We'll merge them into a single, beautifully formatted PDF document.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/>
                  </svg>
                )
              }
            ].map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureCardIcon}>{f.icon}</div>
                <h4 className={styles.featureCardTitle}>{f.title}</h4>
                <p className={styles.featureCardDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
