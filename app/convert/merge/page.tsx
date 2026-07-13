'use client';

import React, { useState, useRef } from 'react';
import styles from './page.module.css';

type FileTab = 'pdf' | 'word' | 'ppt';
type PageState = 'idle' | 'processing' | 'success';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
}

const TAB_LABELS: { key: FileTab; label: string }[] = [
  { key: 'pdf', label: 'PDF' },
  { key: 'word', label: 'Word' },
  { key: 'ppt', label: 'PPT' },
];

const ACCEPT_MAP: Record<FileTab, string> = {
  pdf: '.pdf',
  word: '.doc,.docx',
  ppt: '.ppt,.pptx',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function MergePage() {
  const [activeTab, setActiveTab] = useState<FileTab>('pdf');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pageState, setPageState] = useState<PageState>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (rawFiles: FileList | null) => {
    if (!rawFiles) return;
    const newFiles: UploadedFile[] = Array.from(rawFiles).map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: formatSize(f.size),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleMerge = () => {
    setPageState('processing');
    setTimeout(() => {
      setPageState('success');
    }, 2500);
  };

  const handleReset = () => {
    setFiles([]);
    setPageState('idle');
  };

  return (
    <div className={styles.container}>
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/merge-bg.png"
        alt="background image"
        aria-hidden="true"
        className={styles.bgImg}
      />
      {/* Fixed blurred background */}
      <div className={styles.bgLayer} />

      <div className={styles.main}>
        {/* Heading */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Merge Documents</h1>
          <p className={styles.pageDesc}>
            Combine PDF, Word, and PowerPoint files into a single high-quality document in seconds.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabRow}>
          <div className={styles.tabGroup}>
            {TAB_LABELS.map((t) => (
              <button
                key={t.key}
                className={`${styles.tabBtn} ${activeTab === t.key ? styles.active : ''}`}
                onClick={() => { setActiveTab(t.key); setFiles([]); setPageState('idle'); }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Glass Card */}
        <div className={styles.workspaceCard}>

          {/* ── Dropzone ── */}
          <div
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            <div className={styles.dropzoneIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>cloud_upload</span>
            </div>
            <div>
              <p className={styles.dropzoneTitle}>Select or drop files here</p>
              <p className={styles.dropzoneHint}>
                {activeTab === 'pdf' && 'Supports PDF up to 50 MB each'}
                {activeTab === 'word' && 'Supports .doc & .docx up to 50 MB each'}
                {activeTab === 'ppt' && 'Supports .ppt & .pptx up to 50 MB each'}
              </p>
            </div>
            <button className={styles.chooseBtn} type="button">Choose Files</button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT_MAP[activeTab]}
              style={{ display: 'none' }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* ── File list ── */}
          {files.length > 0 && (
            <div className={styles.fileListArea}>
              <p className={styles.fileListLabel}>Files to merge — drag to reorder</p>
              {files.map((f) => (
                <div key={f.id} className={styles.fileItem}>
                  <span className={styles.dragHandle} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </span>
                  <div className={styles.fileItemIcon}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>description</span>
                  </div>
                  <div className={styles.fileItemInfo}>
                    <p className={styles.fileItemName}>{f.name}</p>
                    <p className={styles.fileItemSize}>{f.size}</p>
                  </div>
                  <button className={styles.fileItemRemove} onClick={() => removeFile(f.id)} aria-label="Remove file">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Action Bar ── */}
          {files.length > 0 && (
            <div className={styles.actionBar}>
              <p className={styles.fileCount}>
                <span className={styles.fileCountBold}>{files.length} file{files.length !== 1 ? 's' : ''}</span> selected
              </p>
              <button className={styles.mergeBtn} onClick={handleMerge} disabled={files.length < 2}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>merge</span>
                Merge {files.length < 2 ? '(add ≥2 files)' : 'Now'}
              </button>
            </div>
          )}

          {/* ── Processing Overlay ── */}
          {pageState === 'processing' && (
            <div className={styles.processingOverlay}>
              <div className={styles.spinnerWrapper}>
                <div className={styles.spinnerRing} />
                <div className={styles.spinnerArc} />
                <span className={styles.spinnerIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>sync</span>
                </span>
              </div>
              <p className={styles.processingTitle}>Merging your files…</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}>
                  <div className={styles.progressShimmer} />
                </div>
              </div>
              <p className={styles.processingHint}>Applying high-fidelity processing…</p>
            </div>
          )}

          {/* ── Success Overlay ── */}
          {pageState === 'success' && (
            <div className={styles.successOverlay}>
              <div className={styles.successIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--secondary)' }}>verified</span>
              </div>
              <p className={styles.successTitle}>Merge Complete!</p>
              <p className={styles.successMeta}>
                <strong>Merged_Document.{activeTab === 'ppt' ? 'pptx' : activeTab}</strong><br />
                <span style={{ fontSize: 12, opacity: 0.7 }}>Ready for download</span>
              </p>
              <div className={styles.successActions}>
                <button className={styles.downloadBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                  Download Now
                </button>
                <button className={styles.newMergeBtn} onClick={handleReset}>New Merge</button>
              </div>
              <div className={styles.secondaryLinks}>
                <a href="#" className={styles.secondaryLink}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cloud_upload</span>
                  Save to Drive
                </a>
                <a href="#" className={styles.secondaryLink}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>mail</span>
                  Send via Email
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Features Row */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>shield_lock</span>
            </div>
            <p className={styles.featureTitle}>Secure &amp; Encrypted</p>
            <p className={styles.featureDesc}>AES-256 security. Files auto-deleted after 1 hour.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>verified_user</span>
            </div>
            <p className={styles.featureTitle}>Lossless Quality</p>
            <p className={styles.featureDesc}>Text sharpness and image resolution fully preserved.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconBox}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>cloud_done</span>
            </div>
            <p className={styles.featureTitle}>Cloud Ready</p>
            <p className={styles.featureDesc}>Import &amp; export with Google Drive and Dropbox.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
