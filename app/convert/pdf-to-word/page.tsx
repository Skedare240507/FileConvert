'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

type Format = 'docx' | 'doc';

interface SelectedFile {
  file: File;
  id: string;
}

const FORMAT_OPTIONS: { key: Format; label: string; desc: string }[] = [
  { key: 'docx', label: 'DOCX', desc: 'Modern format' },
  { key: 'doc',  label: 'DOC',  desc: 'Legacy format' },
];

export default function PdfToWord() {
  const [format, setFormat]       = useState<Format>('docx');
  const [files, setFiles]         = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [converting, setConverting] = useState(false);
  const [done, setDone]           = useState(false);
  
  // Real implementation state
  const [progress, setProgress]   = useState<{ status: string; percent: number }>({ status: 'idle', percent: 0 });
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setDone(false);
    setErrorMsg(null);
    const next = Array.from(incoming).map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setDone(false);
    setErrorMsg(null);
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
    
    setConverting(true);
    setDone(false);
    setErrorMsg(null);
    setProgress({ status: 'initializing upload...', percent: 10 });

    try {
      // Process first file for now in this proof-of-concept
      const fileObj = files[0].file;
      const sourceType = 'pdf';
      const targetType = format;
      
      // 1. Upload Init
      const initRes = await fetch('/api/convert/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileObj.name,
          mimeType: fileObj.type || 'application/pdf',
          fileSizeBytes: fileObj.size,
          sourceType,
          targetType,
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.error || 'Upload initialization failed');
      }

      const { r2Key, uploadUrl } = await initRes.json();

      // 2. Direct B2 Upload
      setProgress({ status: 'uploading to B2...', percent: 20 });
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileObj,
        headers: {
          'Content-Type': fileObj.type || 'application/pdf',
        },
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // 3. Create Job
      setProgress({ status: 'creating job...', percent: 40 });
      const jobRes = await fetch('/api/convert/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          r2InputKey: r2Key,
          sourceType,
          targetType,
          fileCount: 1,
        }),
      });

      if (!jobRes.ok) {
        const err = await jobRes.json();
        throw new Error(err.error || 'Failed to create conversion job');
      }

      const { jobId } = await jobRes.json();

      // 4. SSE Progress
      setProgress({ status: 'queued', percent: 45 });
      
      await new Promise<void>((resolve, reject) => {
        const es = new EventSource(`/api/convert/jobs/${jobId}/live`);
        
        es.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.status === 'completed') {
              setProgress({ status: 'completed', percent: 100 });
              es.close();
              resolve();
            } else if (data.status === 'failed') {
              es.close();
              reject(new Error(data.error || 'Conversion worker failed'));
            } else {
              // Update progress state
              setProgress({ 
                status: data.status || 'processing', 
                percent: data.progress || 50 
              });
            }
          } catch (err) {
            console.error('SSE JSON parse error', err);
          }
        };

        es.onerror = (e) => {
          es.close();
          reject(new Error('SSE connection disconnected unexpectedly'));
        };
      });

      // 5. Download Trigger
      setProgress({ status: 'downloading...', percent: 100 });
      setDone(true);
      window.location.href = `/api/convert/jobs/${jobId}/download`;

    } catch (err: any) {
      console.error('Conversion flow error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setConverting(false);
    }
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
        <img
          src="/pdf-to-word-bg.jpg?v=2"
          alt=""
          aria-hidden="true"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay} />

        {/* Glass conversion card */}
        <div className={styles.card}>

          {/* Card header */}
          <div className={styles.cardHeader}>
            <div className={styles.cardBadge}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <h1 className={styles.cardTitle}>PDF to Word</h1>
              <p className={styles.cardDesc}>
                Convert PDFs to fully editable Word documents — fonts, tables, and layouts preserved with precision.
              </p>
            </div>
          </div>

          {/* Format selector */}
          <div className={styles.formatSection}>
            <span className={styles.sectionLabel}>OUTPUT FORMAT</span>
            <div className={styles.formatRow}>
              {FORMAT_OPTIONS.map(({ key, label, desc }) => (
                <button
                  key={key}
                  className={`${styles.formatBtn} ${format === key ? styles.formatActive : ''}`}
                  onClick={() => setFormat(key)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className={styles.formatLabel}>{label}</span>
                  <span className={styles.formatDesc}>{desc}</span>
                </button>
              ))}
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
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h3 className={styles.dropHeading}>
              {isDragging ? 'Drop your PDF here' : 'Drag & drop PDF here'}
            </h3>
            <p className={styles.dropSub}>or click to browse your computer</p>
            <span className={styles.chooseBtn}>Choose File</span>
            <p className={styles.dropHint}>Supports PDF · Max 50 MB per file</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className={styles.fileSection}>
              <div className={styles.fileSectionHead}>
                <span className={styles.fileSectionTitle}>SELECTED FILES ({files.length})</span>
                <button className={styles.clearAllBtn} onClick={() => { setFiles([]); setDone(false); }}>
                  Clear all
                </button>
              </div>
              <div className={styles.fileItems}>
                {files.map(({ file, id }) => (
                  <div key={id} className={styles.fileRow}>
                    <div className={styles.fileRowLeft}>
                      <div className={styles.fileIconWrap}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className={styles.errorMessage} style={{ color: '#ef4444', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fca5a5' }}>
                  <strong>Error: </strong> {errorMsg}
                </div>
              )}

              {/* Progress UI */}
              {converting && !errorMsg && (
                <div style={{ marginBottom: '16px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', height: '8px' }}>
                  <div style={{ height: '100%', background: '#2563eb', width: `${progress.percent}%`, transition: 'width 0.3s ease' }} />
                </div>
              )}

              {/* Convert / Done button */}
              {done ? (
                <button className={`${styles.convertBtn} ${styles.convertBtnDone}`} onClick={() => { setFiles([]); setDone(false); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Download .{format} — Convert another
                </button>
              ) : (
                <button
                  className={`${styles.convertBtn} ${converting ? styles.convertBtnLoading : ''}`}
                  onClick={handleConvert}
                  disabled={converting}
                >
                  {converting ? (
                    <>
                      <span className={styles.spinner} />
                      {progress.status} ({progress.percent}%)
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Convert to .{format.toUpperCase()}
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
          <h2 className={styles.infoHeading}>Why FileConvert for PDF → Word?</h2>
          <p className={styles.infoSubheading}>Trusted by professionals across industries for flawless, fast document conversion.</p>
          <div className={styles.infoGrid}>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#fff1f2' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Flawless Formatting</h3>
              <p className={styles.infoDesc}>Advanced layout engine preserves fonts, tables, columns, and spacing — pixel-perfect every time.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#f0fdf4' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Enterprise Security</h3>
              <p className={styles.infoDesc}>All files are encrypted in transit with 256-bit SSL and automatically wiped from servers after 60 minutes.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#eff6ff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Cloud Processing</h3>
              <p className={styles.infoDesc}>High-speed server clusters handle complex documents in seconds — no software to install, ever.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#faf5ff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className={styles.infoTitle}>Batch Conversion</h3>
              <p className={styles.infoDesc}>Upload multiple PDFs at once and receive all your Word files in a single convenient download.</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIconWrap} style={{ background: '#fff7ed' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <h3 className={styles.infoTitle}>100% Free</h3>
              <p className={styles.infoDesc}>No sign-up required. No hidden limits. Convert as many documents as you need, completely free.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
