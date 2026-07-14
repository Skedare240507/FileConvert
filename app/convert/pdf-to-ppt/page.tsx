'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface SelectedFile {
  file: File;
  id: string;
}

export default function PdfToPptPage() {
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
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_yCTRUb9vQ-aC_x-yA2AIBlwhhJyDYplt_4jRdlCdrXrehKW6dnyPFKvdARggE4Z1IfPA1TlsQhTERP_4DfSZd1GdGukY8OSSrx1ZgkSuVEwYUHbRLE_wwdWNbFg7jyOSpc3-ybgxqh44ggYtS5XN2yvtcsB3CJUD4VuV_9lw_v79mcft-3Fue1fkX4Sgeu-jKvb8DV5LvBO6ShaOkW9ToLFCv50nFNEbi0PTLEYnNR5JVpQru9Avpi_dhikUDXRUWbQlfgopVA" alt="" aria-hidden="true" className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        {/* Glass Card */}
        <div className={styles.card}>

          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.cardBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h20v14H2z"/>
                <path d="M12 17v4"/>
                <path d="M8 21h8"/>
                <path d="M16 8l-4 4-4-4"/>
              </svg>
            </div>
            <div>
              <h1 className={styles.cardTitle}>PDF to PPT</h1>
              <p className={styles.cardDesc}>
                Convert your PDF presentations into fully editable PowerPoint slides with precise formatting preserved.
              </p>
            </div>
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
                  Download PPTX — Convert another
                </button>
              ) : (
                <button
                  className={`${styles.convertBtn} ${converting ? styles.convertBtnLoading : ''}`}
                  onClick={handleConvert}
                  disabled={converting}
                >
                  {converting ? (
                    <>Converting…</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h20v14H2z"/>
                      </svg>
                      Convert to PPTX
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
          <h2 className={styles.infoHeading}>Why FileConvert for PDF → PPT?</h2>
          <p className={styles.infoSubheading}>Turn locked PDFs back into dynamic, presentation-ready slides.</p>
          <div className={styles.infoGrid}>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#fff7ed' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Edit Anywhere</h3>
              <p className={styles.infoDesc}>Unlock your PDF slides and edit them in PowerPoint, Keynote, or Google Slides instantly.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#f0fdf4' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Keep Formatting</h3>
              <p className={styles.infoDesc}>Our layout engine intelligently preserves fonts, images, graphs, and master slide structures.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#eff6ff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Blazing Fast</h3>
              <p className={styles.infoDesc}>No matter how big the presentation, our cloud infrastructure converts it in mere seconds.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#faf5ff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Batch Support</h3>
              <p className={styles.infoDesc}>Upload multiple PDF decks at the same time and download all the PPTX files seamlessly.</p>
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
              <h3 className={styles.infoTitle}>No Watermarks</h3>
              <p className={styles.infoDesc}>We provide clean, professional conversions without adding any unwanted logos or watermarks.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#f0fdf4' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Safe & Private</h3>
              <p className={styles.infoDesc}>Your corporate data is safe. We use SSL encryption and auto-delete all files after 60 minutes.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
