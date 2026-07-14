'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

type Quality = 'screen' | 'print' | 'high';

interface SelectedFile {
  file: File;
  id: string;
}

const QUALITY_OPTIONS: { key: Quality; label: string; dpi: string }[] = [
  { key: 'screen', label: 'Screen',   dpi: '72 DPI'  },
  { key: 'print',  label: 'Print',    dpi: '150 DPI' },
  { key: 'high',   label: 'High-Res', dpi: '300 DPI' },
];

const QualityIcons: Record<Quality, React.ReactNode> = {
  screen: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  print: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  high: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

export default function PdfToJpgPage() {
  const [quality, setQuality]       = useState<Quality>('print');
  const [files, setFiles]           = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [done, setDone]             = useState(false);
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

  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleConvert = () => {
    setConverting(true);
    setDone(false);
    setTimeout(() => { setConverting(false); setDone(true); }, 2800);
  };

  const formatSize = (bytes: number) =>
    bytes >= 1024 * 1024
      ? (bytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (bytes / 1024).toFixed(1) + ' KB';

  return (
    <div className={styles.container}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/image-tools-bg.jpg?v=2" alt="" aria-hidden="true" className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        {/* Glass Card */}
        <div className={styles.card}>

          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.cardBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div>
              <h1 className={styles.cardTitle}>PDF to JPG</h1>
              <p className={styles.cardDesc}>
                Convert every PDF page into a crisp, high-resolution JPG image — fast, secure, and free.
              </p>
            </div>
          </div>

          {/* Quality selector */}
          <span className={styles.sectionLabel}>OUTPUT QUALITY</span>
          <div className={styles.qualityRow}>
            {QUALITY_OPTIONS.map(({ key, label, dpi }) => (
              <button
                key={key}
                className={`${styles.qualityBtn} ${quality === key ? styles.qualityActive : ''}`}
                onClick={() => setQuality(key)}
              >
                <span className={styles.qualityIcon}>{QualityIcons[key]}</span>
                <span className={styles.qualityLabel}>{label}</span>
                <span className={styles.qualityDpi}>{dpi}</span>
              </button>
            ))}
          </div>

          {/* Drop zone */}
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
              accept=".pdf"
              multiple
              className={styles.hiddenInput}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
            <div className={styles.dropIconCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3 className={styles.dropHeading}>{isDragging ? 'Release to upload' : 'Drag & drop PDF here'}</h3>
            <p className={styles.dropSub}>or click to browse your computer</p>
            <span className={styles.chooseBtn}>Choose File</span>
            <p className={styles.dropHint}>Supports PDF · Max 50 MB per file</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className={styles.fileSection}>
              <div className={styles.fileSectionHead}>
                <span className={styles.fileSectionTitle}>SELECTED FILES ({files.length})</span>
                <button className={styles.clearAllBtn} onClick={() => { setFiles([]); setDone(false); }}>Clear all</button>
              </div>
              <div className={styles.fileItems}>
                {files.map(({ file, id }) => (
                  <div key={id} className={styles.fileRow}>
                    <div className={styles.fileRowLeft}>
                      <div className={styles.fileIconWrap}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div>
                        <div className={styles.fileRowName}>{file.name}</div>
                        <div className={styles.fileRowSize}>{formatSize(file.size)}</div>
                      </div>
                    </div>
                    <button className={styles.fileRemoveBtn} onClick={() => removeFile(id)} aria-label="Remove file">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {done ? (
                <button className={`${styles.convertBtn} ${styles.convertBtnDone}`} onClick={() => { setFiles([]); setDone(false); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Download JPGs — Convert another
                </button>
              ) : (
                <button
                  className={`${styles.convertBtn} ${converting ? styles.convertBtnLoading : ''}`}
                  onClick={handleConvert}
                  disabled={converting}
                >
                  {converting ? (
                    <><span className={styles.spinner} />Converting…</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Convert to JPG
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── INFO SECTION ── */}
      <section className={styles.infoSection}>
        <div className={styles.infoInner}>
          <h2 className={styles.infoHeading}>Why FileConvert for PDF → JPG?</h2>
          <p className={styles.infoSubheading}>Millions of pages converted. Zero compromises on quality or privacy.</p>
          <div className={styles.infoGrid}>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#eff6ff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Crystal-Clear Output</h3>
              <p className={styles.infoDesc}>Up to 300 DPI resolution ensures every pixel of your PDF renders beautifully as a JPG image.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#f0fdf4' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>256-bit SSL Security</h3>
              <p className={styles.infoDesc}>Your files are encrypted during transit and permanently deleted from our servers after 60 minutes.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#fff7ed' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Lightning Fast</h3>
              <p className={styles.infoDesc}>High-performance cloud servers process every PDF page in milliseconds — no waiting around.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#faf5ff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Batch Processing</h3>
              <p className={styles.infoDesc}>Upload multiple PDFs at once. All JPG pages are zipped together for a single easy download.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#fff1f2' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>All PDF Types</h3>
              <p className={styles.infoDesc}>Works with standard, password-free, scanned, and image-based PDFs of any size or complexity.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#f0fdf4' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>100% Free</h3>
              <p className={styles.infoDesc}>No account needed. No watermarks. No file limits. Convert as many PDFs as you want, forever.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
