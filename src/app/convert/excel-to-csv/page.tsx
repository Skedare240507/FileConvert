'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

import { useConverter } from '@/hooks/useConverter';

interface SelectedFile {
  file: File;
  id: string;
}

export default function ExcelToCsv() {
  const [files, setFiles]         = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { converting, done, progress, errorMsg, startConversion, reset } = useConverter();

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleConvert = async () => {
    if (files.length === 0) return;
    const ext = files[0].file.name.split('.').pop()?.toLowerCase() || 'xlsx';
    await startConversion(files[0].file, ext, 'csv', 1);
  };

  const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024
      ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (bytes / 1024).toFixed(1) + ' KB';

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg} style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnWGXjkzF07p6stHDSm02nfV1IyHpwOV87TKJe1XLRLzHMtr0SayS1Mxpu2AElgZUf4QPezkO8-rxmkLJZMyBmwyweWcuZQv7Xfi1MHj-D1LHjvTDhI6NwkezHeJ-1OtAUYASLRzyt718UYL7qNr2t7KdRs8nELc8RTvjawVKmsrvRVa8CXA2Pe1rRuga51h4VEQpYz3K8nT3lrXCL8xYvV5V_pvEUWkxSO8mSme7y0TesNjb_vUTuwl60Q-EKiFzF0S882b1xWw')"}}></div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.pillBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            Spreadsheet Utility
          </div>
          <h1 className={styles.title}>Excel to CSV</h1>
          <p className={styles.subtitle}>
            Transform your complex Excel workbooks into clean, standard CSV files in seconds. Professional-grade conversion for data analysts and developers.
          </p>

          <div className={styles.workspace}>
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropActive : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.xlsm"
                multiple
                className={styles.hiddenInput}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
              />
              <div className={styles.dropIconCircle}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 className={styles.dropHeading}>Drop your Excel file here</h3>
              <p className={styles.dropHint}>Supports .xlsx, .xls, and .xlsm formats up to 50MB</p>
              <button className={styles.chooseBtn}>Select File from Computer</button>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className={styles.fileSection}>
                <div className={styles.fileItems}>
                  {files.map(({ file, id }) => (
                    <div key={id} className={styles.fileRow}>
                      <div className={styles.fileRowLeft}>
                        <div className={styles.fileIconWrap}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                          </svg>
                        </div>
                        <div>
                          <div className={styles.fileRowName}>{file.name}</div>
                          <div className={styles.fileRowSize}>{formatSize(file.size)}</div>
                        </div>
                      </div>
                      <button className={styles.fileRemoveBtn} onClick={(e) => { e.stopPropagation(); removeFile(id); }} aria-label="Remove file">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.convertAction}>
                  {errorMsg && (
                    <div style={{ color: '#ef4444', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fca5a5' }}>
                      <strong>Error: </strong> {errorMsg}
                    </div>
                  )}
                  {done ? (
                    <button className={`${styles.convertBtn} ${styles.convertBtnDone}`} onClick={(e) => { e.stopPropagation(); setFiles([]); reset(); }}>
                      Download CSV(s) — Convert another
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </button>
                  ) : (
                    <button
                      className={`${styles.convertBtn} ${converting ? styles.convertBtnLoading : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleConvert(); }}
                      disabled={converting}
                    >
                      {converting ? (
                        <>
                          <span className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                          {progress.status} ({progress.percent}%)
                        </>
                      ) : (
                        <>
                          Convert All to CSV
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.featureCard}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.featureIcon}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h4 className={styles.featureTitle}>Private & Secure</h4>
            <p className={styles.featureDesc}>Your files are encrypted and automatically deleted from our servers after 2 hours.</p>
          </div>
          <div className={styles.featureCard}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.featureIcon}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <h4 className={styles.featureTitle}>Cloud Processing</h4>
            <p className={styles.featureDesc}>No software to install. Our high-speed cloud servers handle even the largest workbooks.</p>
          </div>
          <div className={styles.featureCard}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.featureIcon}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <h4 className={styles.featureTitle}>Smart Formatting</h4>
            <p className={styles.featureDesc}>Automatically detects data types and preserves date/currency formats in the CSV output.</p>
          </div>
        </div>
      </section>

      {/* Informational Content */}
      <section className={styles.infoSection}>
        <div className={styles.infoContainer}>
          <div className={styles.infoCard}>
            <h2 className={styles.infoHeading}>Why convert Excel to CSV?</h2>
            <div className={styles.infoList}>
              <div className={styles.infoListItem}>
                <div className={styles.infoListIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                  </svg>
                </div>
                <div>
                  <h5 className={styles.infoListTitle}>Data Interoperability</h5>
                  <p className={styles.infoListDesc}>CSV is the universal format for data exchange between different software applications and databases.</p>
                </div>
              </div>
              <div className={styles.infoListItem}>
                <div className={styles.infoListIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6.01" y2="6"></line>
                    <line x1="6" y1="18" x2="6.01" y2="18"></line>
                  </svg>
                </div>
                <div>
                  <h5 className={styles.infoListTitle}>Lightweight Files</h5>
                  <p className={styles.infoListDesc}>CSV files contain only raw data, making them significantly smaller than Excel workbooks with styling and metadata.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.infoImageWrapper}>
            <img suppressHydrationWarning src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Data analysis showing spreadsheet conversion" className={styles.infoImage} />
          </div>
        </div>
      </section>
    </div>
  );
}
