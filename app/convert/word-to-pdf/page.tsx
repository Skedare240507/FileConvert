'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';
import { useConverter } from '@/hooks/useConverter';

interface SelectedFile {
  file: File;
  id: string;
}

export default function WordToPdf() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { converting, done, progress, errorMsg, startConversion, reset } = useConverter();

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles).map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
    }));
    setFiles(prev => [...prev, ...filesArray]);
    reset(); // Reset conversion state if new files added
  }, [reset]);

  const removeFile = (idToRemove: string) => {
    setFiles(prev => prev.filter(f => f.id !== idToRemove));
    reset();
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    // For now we process the first file, you can map multiple files if desired
    await startConversion(files[0].file, 'word', 'pdf', 1);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgkDzhIMl7FHEghf_01JPm-BYunvYNRr1riYjzL8mz6MQGbWUEPOuNL1c0qElILFruSp8YvjQVGbzn0lh1EEsl_g3dZZoBnqmsG3dFh0OzuN29v47OeWZDNukJ4bdoFQEheaer8PHvuAMmg5jMY3Bnwxrh46f8TcdeNIhj_ej65sxX37nxOofCPbGKSIP0v-HR_W9Ybk3a6FIYlA9AI9CEIA4Mz1NFFScr4Ji4HQWnvgDj0IQqg9qOK_Gian_QEHRjlTpMnNs6Jg"
          alt="Workspace"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay} />
        
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Word to PDF</h1>
          <p className={styles.subtitle}>
            Convert your Microsoft Word documents to professional PDF files in seconds. Maintain formatting, fonts, and layout with our high-fidelity conversion engine.
          </p>
        </div>
      </section>

      {/* Tool Workspace */}
      <section className={styles.workspaceSection}>
        <div className={styles.workspaceWrapper}>
          
          <div className={styles.workspace}>
            <div className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx"
                multiple
                className={styles.fileInput}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              />
              <div className={styles.dropIconWrap}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <h2 className={styles.dropHeading}>Choose Word files</h2>
              <p className={styles.dropSub}>or drag and drop them here</p>
              <button type="button" className={styles.selectBtn} tabIndex={-1}>
                Select Files
              </button>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className={styles.fileListContainer}>
                <div className={styles.listHeader}>
                  <h3 className={styles.listTitle}>Selected Documents</h3>
                  <span className={styles.fileBadge}>
                    {files.length} File{files.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className={styles.fileList}>
                  {files.map(({ file, id }) => (
                    <div key={id} className={styles.fileItem}>
                      <div className={styles.fileItemLeft}>
                        <div className={styles.fileIcon}>
                          <span className="material-symbols-outlined">description</span>
                        </div>
                        <div>
                          <p className={styles.fileName} title={file.name}>{file.name}</p>
                          <p className={styles.fileSize}>{formatBytes(file.size)}</p>
                        </div>
                      </div>
                      <div className={styles.fileItemRight}>
                        {converting && (
                          <div className={styles.progressBarContainer}>
                            <div className={styles.progressBar} style={{ width: `${progress.percent}%` }}></div>
                          </div>
                        )}
                        <button 
                          className={styles.removeBtn} 
                          onClick={() => removeFile(id)}
                          aria-label="Remove file"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {errorMsg && (
                  <div style={{ color: '#ef4444', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fca5a5' }}>
                    <strong>Error: </strong> {errorMsg}
                  </div>
                )}

                <div className={styles.actionRow}>
                  <button 
                    className={`${styles.convertBtn} ${done ? styles.convertBtnSuccess : ''}`}
                    onClick={done ? () => { setFiles([]); reset(); } : handleConvert}
                    disabled={converting && !done}
                  >
                    {converting ? (
                      <>
                        <span className={`material-symbols-outlined ${styles.spinIcon}`}>sync</span>
                        {progress.status} ({progress.percent}%)
                      </>
                    ) : done ? (
                      <>
                        <span className="material-symbols-outlined">download</span>
                        Download All PDF Files
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">sync</span>
                        Convert to PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={`material-symbols-outlined ${styles.featureIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <h4 className={styles.featureTitle}>Secure Processing</h4>
              <p className={styles.featureDesc}>Your files are encrypted using 256-bit SSL and deleted automatically after conversion.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={`material-symbols-outlined ${styles.featureIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h4 className={styles.featureTitle}>High Fidelity</h4>
              <p className={styles.featureDesc}>We preserve all styles, images, and tables exactly as they appear in your Word document.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={`material-symbols-outlined ${styles.featureIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
              <h4 className={styles.featureTitle}>Cloud Based</h4>
              <p className={styles.featureDesc}>Perform heavy document processing in the cloud without slowing down your computer.</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
