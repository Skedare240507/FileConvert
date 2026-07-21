'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface SelectedFile {
  file: File;
  id: string;
}

export default function PptToPdf() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const formatMB = (bytes: number) =>
    `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className={styles.container}>
      <main className="flex-grow relative">
        {/* ===== HERO BACKGROUND ===== */}
        <div className={styles.heroContainer}>
          <div className={styles.heroBackground}>
            <div className={styles.heroImage} />
            <div className={styles.heroGradient} />
          </div>

          <div className={styles.heroContentWrapper}>
            {/* Hero Content */}
            <div className={styles.heroText}>
              <h1 className={styles.title}>PPT to PDF</h1>
              <p className={styles.subtitle}>
                Convert your PowerPoint presentations to professional PDF documents instantly.
                Fast, secure, and perfectly formatted every time.
              </p>
            </div>

            {/* Conversion Workspace */}
            <div className={styles.workspaceSection}>
              <div
                className={`${styles.glassCard} ${isDragOver ? styles.dropzoneActive : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ppt,.pptx"
                  multiple
                  className={styles.fileInput}
                  onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                />
                
                <div className={styles.dropContent}>
                  <div className={styles.iconWrapper}>
                    <span className={`material-symbols-outlined ${styles.dropIcon}`}>upload_file</span>
                  </div>
                  <div className={styles.dropTextWrap}>
                    <h3 className={styles.dropHeading}>Drop your PowerPoint files here</h3>
                    <p className={styles.dropSub}>or click to browse your computer</p>
                  </div>
                  <div className={styles.formatTags}>
                    <span className={styles.formatTag}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span> PPTX
                    </span>
                    <span className={styles.formatTag}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span> PPT
                    </span>
                  </div>
                </div>

                {/* Ambient lights */}
                <div className={styles.ambientLight1} />
                <div className={styles.ambientLight2} />
              </div>

              {/* Active File List */}
              {files.length > 0 && (
                <div className={styles.fileList}>
                  {files.map(({ file, id }) => (
                    <div key={id} className={styles.fileItem}>
                      <div className={styles.fileItemLeft}>
                        <span className={`material-symbols-outlined ${styles.fileIcon}`}>presentation_play</span>
                        <div>
                          <p className={styles.fileName}>{file.name}</p>
                          <p className={styles.fileSize}>{formatMB(file.size)}</p>
                        </div>
                      </div>
                      <div className={styles.fileItemRight}>
                        <div className={styles.progressBarWrap}>
                          <div className={styles.progressBar} />
                        </div>
                        <button className={styles.convertTextBtn}>CONVERT</button>
                        <button className={styles.removeBtn} onClick={() => removeFile(id)} aria-label="Remove file">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Features Section */}
            <section className={styles.featuresSection}>
              <div className={styles.featuresHeader}>
                <h2 className={styles.featuresTitle}>Why use FileConvert?</h2>
                <div className={styles.featuresLine} />
              </div>

              <div className={styles.featuresGrid}>
                {/* Feature Card 1 */}
                <div className={styles.featureCard}>
                  <div className={`${styles.featureIconWrap} ${styles.iconWrapSecure}`}>
                    <span className={`material-symbols-outlined ${styles.iconWrapSecureIcon}`}>shield</span>
                  </div>
                  <h4 className={styles.featureCardTitle}>Secure Processing</h4>
                  <p className={styles.featureCardDesc}>
                    Your data is handled with end-to-end encryption. All files are permanently deleted from our servers 2 hours after conversion.
                  </p>
                </div>

                {/* Feature Card 2 */}
                <div className={styles.featureCard}>
                  <div className={`${styles.featureIconWrap} ${styles.iconWrapQuality}`}>
                    <span className={`material-symbols-outlined ${styles.iconWrapQualityIcon}`}>high_quality</span>
                  </div>
                  <h4 className={styles.featureCardTitle}>High Resolution</h4>
                  <p className={styles.featureCardDesc}>
                    Retain every font, vector image, and layout detail. Our engine ensures pixel-perfect conversion for professional printing.
                  </p>
                </div>

                {/* Feature Card 3 */}
                <div className={styles.featureCard}>
                  <div className={`${styles.featureIconWrap} ${styles.iconWrapFast}`}>
                    <span className={`material-symbols-outlined ${styles.iconWrapFastIcon}`}>bolt</span>
                  </div>
                  <h4 className={styles.featureCardTitle}>Lightning Fast</h4>
                  <p className={styles.featureCardDesc}>
                    Optimized cloud infrastructure handles multi-gigabyte files in seconds. No waiting queues, just instant results.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
