'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface SelectedFile {
  file: File;
  id: string;
}

export default function JpgToPptPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setDone(false);
    const next = Array.from(incoming).map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDone(false);
  };

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleConvert = () => {
    setConverting(true);
    setDone(false);
    setTimeout(() => { setConverting(false); setDone(true); }, 2500);
  };

  const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024
      ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (bytes / 1024).toFixed(1) + ' KB';

  return (
    <>
      {/* Hero Section with Photo Background */}
      <section className={styles.hero}>
        <img suppressHydrationWarning
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJGGZe3ph0gaL6D6Z4bCiEYp5Ja3vSVFsd0fUQzWiVQNJD38hRCHgyFr9zQem5Qm6U5-m-YBpiJ3sKxxsXJVVTDrIPocNrBQyF9DCQekNMcLtlOx6Isj_4asIEdwCjloC00Ihmvg6FXCRVJA20xBtTTLe5iaVaFuksEDurpSATZXtV2h5SvEvahSCZBzy9m1_20g2Kmoayp2_uDou_vsZ5CmMBFusGgb6MC1WDEjg7_BM_CHZPfQWx5fl7dgQj_buwtTfG7Wo9hQ"
          alt="A sophisticated high-angle view of a clean, minimalist wooden desk..."
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay}></div>
        
        <div className={styles.heroContent}>
          <div className={styles.glassPanel}>
            <h1 className={styles.title}>JPG to PPT</h1>
            <p className={styles.subtitle}>
              Convert your images into professional PowerPoint presentations in seconds. High-quality, fast, and secure.
            </p>
            
            {/* Drag & Drop Zone */}
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.gif,.tiff"
                multiple
                className={styles.dropZoneHiddenInput}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
              />
              <div className={styles.dropZoneContent}>
                <div className={styles.dropIconWrap}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <div>
                  <h3 className={styles.dropHeading}>Select JPG images</h3>
                  <p className={styles.dropSub}>or drop them here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Files Section (Shown when files selected) */}
      {files.length > 0 && (
        <section className={styles.fileListSection}>
          <div className={styles.fileListInner}>
            <div className={styles.fileListHeader}>
              <h2 className={styles.fileListTitle}>Selected Images</h2>
              <span className={styles.fileCount}>
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className={styles.fileGrid}>
              {files.map(({ file, id }) => (
                <div key={id} className={styles.fileItem}>
                  <div className={styles.fileItemLeft}>
                    <div className={styles.fileItemIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.fileItemName}>{file.name}</p>
                      <p className={styles.fileItemSize}>{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button className={styles.fileRemoveBtn} onClick={() => removeFile(id)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            <div className={styles.convertWrap}>
              {done ? (
                <button className={`${styles.convertBtn} ${styles.convertBtnDone}`} onClick={() => { setFiles([]); setDone(false); }}>
                  Download PPT
                </button>
              ) : (
                <button
                  className={`${styles.convertBtn} ${converting ? styles.convertBtnLoading : ''}`}
                  onClick={handleConvert}
                  disabled={converting}
                >
                  {converting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Converting...
                    </span>
                  ) : (
                    'Convert to PPT'
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresInner}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Secure Processing</h3>
              <p className={styles.featureDesc}>
                Your files are encrypted with 256-bit SSL security and deleted automatically after 2 hours.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>High Resolution</h3>
              <p className={styles.featureDesc}>
                We preserve the original quality of your JPGs while optimizing the presentation file size.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Lightning Fast</h3>
              <p className={styles.featureDesc}>
                Cloud-based processing ensures your conversion happens in seconds, regardless of file size.
              </p>
            </div>
          </div>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}
