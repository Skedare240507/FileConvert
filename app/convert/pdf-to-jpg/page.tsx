'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

type Quality = 'screen' | 'print' | 'high';

interface SelectedFile {
  file: File;
  id: string;
}

const QUALITY_OPTIONS: { key: Quality; label: string; dpi: string; icon: string }[] = [
  { key: 'screen', label: 'Screen', dpi: '72 DPI', icon: 'monitor' },
  { key: 'print',  label: 'Print',  dpi: '150 DPI', icon: 'print' },
  { key: 'high',   label: 'High-res', dpi: '300 DPI', icon: 'high_quality' },
];

export default function PdfToJpgPage() {
  const [quality, setQuality] = useState<Quality>('print');
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles = Array.from(incoming).map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleConvert = () => {
    setConverting(true);
    setTimeout(() => setConverting(false), 2500);
  };

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + ' MB';

  return (
    <div className={styles.container}>

      {/* ===== HERO with background image ===== */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD81otKYpsypF9Uu2MMj3JNLAZxG3hMSYX2WStBRFfbLBtXIzcOdOGmCqFZSRDmQQddnXG0n4InOh0qFLoYajdaIF5jlogRVVm-OBjEYjeJpFNeMJAtoMfrePFHudC3-Dq2euYhk5d7KTXiItKg1cV_ah_tIdODsjiv1wGXILJ13KjkX5Gr4xwKyDH4lBBIqAk1qvDq_ff1JUdz5NlvNiTR8m8v63qbmhsY9v6jhgmVlv7s2KnHYH2wenUOrfMRjizWyBlaGUumRQ"
          alt=""
          aria-hidden="true"
          className={styles.heroBgImg}
        />
        <div className={styles.heroBgOverlay} />

        {/* Glass Card */}
        <div className={styles.card}>
          {/* Title */}
          <h1 className={styles.cardTitle}>PDF to JPG</h1>
          <p className={styles.cardDesc}>
            Convert each PDF page into a high-quality JPG image. Efficient, secure, and ready for your professional workflow.
          </p>

          {/* Quality Selector */}
          <p className={styles.qualityLabel}>SELECT OUTPUT QUALITY</p>
          <div className={styles.qualityRow}>
            {QUALITY_OPTIONS.map(({ key, label, dpi, icon }) => (
              <button
                key={key}
                className={`${styles.qualityBtn} ${quality === key ? styles.qualityActive : ''}`}
                onClick={() => setQuality(key)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{icon}</span>
                <span className={styles.qualityName}>{label}</span>
                <span className={styles.qualityDpi}>{dpi}</span>
              </button>
            ))}
          </div>

          {/* Drop Zone */}
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
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>upload_file</span>
            </div>
            <h3 className={styles.dropHeading}>Drop your PDF here</h3>
            <p className={styles.dropSub}>Or click to browse your computer</p>
            <span className={styles.chooseBtn}>Choose File</span>
          </div>

          {/* File List (shown after selection) */}
          {files.length > 0 && (
            <div className={styles.fileSection}>
              <div className={styles.fileSectionHead}>
                <span className={styles.fileSectionTitle}>SELECTED FILES</span>
                <button className={styles.clearAllBtn} onClick={() => setFiles([])}>Clear all</button>
              </div>
              <div className={styles.fileItems}>
                {files.map(({ file, id }) => (
                  <div key={id} className={styles.fileRow}>
                    <div className={styles.fileRowLeft}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--primary)' }}>picture_as_pdf</span>
                      <div>
                        <div className={styles.fileRowName}>{file.name}</div>
                        <div className={styles.fileRowSize}>{formatSize(file.size)}</div>
                      </div>
                    </div>
                    <button className={styles.fileRemoveBtn} onClick={() => removeFile(id)} aria-label="Remove file">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
              <button
                className={`${styles.convertBtn} ${converting ? styles.convertBtnLoading : ''}`}
                onClick={handleConvert}
                disabled={converting}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>bolt</span>
                {converting ? 'Converting…' : 'Convert to JPG'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== Info Section ===== */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={`material-symbols-outlined ${styles.infoIcon}`}>security</span>
            <h3 className={styles.infoTitle}>100% Secure</h3>
            <p className={styles.infoDesc}>Your files are encrypted with 256-bit SSL and automatically deleted after conversion to ensure your privacy.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={`material-symbols-outlined ${styles.infoIcon}`}>speed</span>
            <h3 className={styles.infoTitle}>Lightning Fast</h3>
            <p className={styles.infoDesc}>Our high-performance servers process document pages into high-resolution JPGs in seconds, not minutes.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={`material-symbols-outlined ${styles.infoIcon}`}>photo_library</span>
            <h3 className={styles.infoTitle}>Batch Processing</h3>
            <p className={styles.infoDesc}>Upload multiple PDFs at once. We'll zip all the JPG outputs together for a single, easy download.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
