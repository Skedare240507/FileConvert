'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

import { useConverter } from '@/hooks/useConverter';

interface SelectedFile {
  file: File;
  id: string;
}

export default function WordToJpg() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { converting, done, progress, errorMsg, startConversion, reset } = useConverter();

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    setFiles(prev => [
      ...prev,
      ...Array.from(newFiles).map(file => ({
        file,
        id: Math.random().toString(36).substring(7),
      })),
    ]);
  }, []);

  const removeFile = (id: string) =>
    setFiles(prev => prev.filter(f => f.id !== id));

  const clearAll = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    reset();
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    const ext = files[0].file.name.split('.').pop()?.toLowerCase() || 'docx';
    const sourceType = ext === 'doc' ? 'doc' : 'docx';
    await startConversion(files[0].file, sourceType, 'jpg', 1);
  };

  const formatMB = (bytes: number) =>
    `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className={styles.container}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img suppressHydrationWarning
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK123oIKEVnSzUw9nFR1-PVcXPFH63XVRRxl2IvSH5vniRzeQ94kenfwzlWp0FFw5Q53On6eMb_K1cd0ONWHXh3RoNOj3QTxUNwdtfyS_BNky58eqYetXFgc_fRYeYyJ2fQ9KuqqRzMk2PxC9V6Wz0dNEDS4nYysmXzcuHNgTE7mdcRvsdIqrPFANbDCEOpcURK2XwIl-Nauo8MOg25SATXy1sFtgouQKRerpVZbn6mhx1HNeajEG5uHEIgnubsYZPsdEiCj0xbw"
          alt="Workspace background"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Word to JPG</h1>
          <p className={styles.subtitle}>
            Convert your Word documents into high-quality JPG images instantly.
            Clean, fast, and secure document processing for professionals.
          </p>
        </div>
      </section>

      {/* ===== WORKSPACE ===== */}
      <section className={styles.workspaceSection}>
        <div className={styles.workspaceCard}>
          {/* Drop Zone */}
          <div
            className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <div className={styles.dropIconWrap}>
              <span className={`material-symbols-outlined ${styles.dropIcon}`}>upload_file</span>
            </div>
            <h3 className={styles.dropHeading}>Drop your Word files here</h3>
            <p className={styles.dropSub}>or click to browse your computer</p>
            <button type="button" className={styles.selectBtn} tabIndex={-1}>
              Select Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx"
              multiple
              className={styles.fileInput}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
          </div>

          {/* Selected File List */}
          {files.length > 0 && (
            <div className={styles.fileListContainer}>
              <div className={styles.listHeader}>
                <h4 className={styles.listTitle}>Ready to Convert</h4>
                <button className={styles.clearAllBtn} onClick={clearAll}>Remove all</button>
              </div>

              <div className={styles.fileList}>
                {files.map(({ file, id }) => (
                  <div key={id} className={styles.fileItem}>
                    <div className={styles.fileItemLeft}>
                      <div className={styles.fileIcon}>
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <p className={styles.fileName}>{file.name}</p>
                        <p className={styles.fileSize}>{formatMB(file.size)}</p>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeFile(id)} aria-label="Remove file">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div style={{ color: '#ef4444', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fca5a5' }}>
                  <strong>Error: </strong> {errorMsg}
                </div>
              )}

              <div className={styles.actionBtns}>
                {!done && <button className={styles.addMoreBtn} onClick={() => fileInputRef.current?.click()} disabled={converting}>Add More</button>}
                {done ? (
                  <button className={`${styles.convertBtn} ${styles.convertBtnDone}`} onClick={clearAll}>
                    <span>Download JPG(s)</span>
                    <span className="material-symbols-outlined">download</span>
                  </button>
                ) : (
                  <button className={styles.convertBtn} onClick={handleConvert} disabled={converting}>
                    {converting ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {progress.status} ({progress.percent}%)
                      </span>
                    ) : (
                      <>
                        <span>Convert to JPG</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== FEATURES ===== */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <span className={`material-symbols-outlined ${styles.featureIcon}`}>lock</span>
            <h5 className={styles.featureTitle}>Secure &amp; Private</h5>
            <p className={styles.featureDesc}>Your files are encrypted and automatically deleted after 2 hours.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={`material-symbols-outlined ${styles.featureIcon}`}>high_quality</span>
            <h5 className={styles.featureTitle}>High Resolution</h5>
            <p className={styles.featureDesc}>Maintains original document formatting and crystal clear image output.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={`material-symbols-outlined ${styles.featureIcon}`}>speed</span>
            <h5 className={styles.featureTitle}>Instant Processing</h5>
            <p className={styles.featureDesc}>Convert complex DOCX files to JPG in seconds with our cloud engine.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
