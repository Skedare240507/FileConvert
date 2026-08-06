'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface SelectedFile {
  file: File;
  id: string;
}

export default function WordToPpt() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const removeFile = (id: string) =>
    setFiles(prev => prev.filter(f => f.id !== id));

  const clearAll = () => {
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatMB = (bytes: number) =>
    `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className={styles.container}>

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaxoXDfQyoOj9oDcRKlbzaI1BTVjYOYZwloCKBFZetcGt7v5oRgvqJ0jqN466TMuTsRySdov-KnBJ5Tu7_D23yq7lU5zcPsPRsRbONkNPnw8yWWkL2xrDi7-4xPcEXKinfnsZdEod2omtDMaj7l6cTGQVQfBjViYEeqYG7VPcd4IREt2cCLwhKfB6_b9Hsw3-n3_FQaM7b9XZKiCrFNFDjyi7BXJxeP80UENBdEAtE9vblMiyWeNMlGSW7w5sgEB8vC3garfHaDQ"
          alt="Workspace background"
          className={styles.heroBgImg}
        />
        <div className={styles.heroOverlay} />

        <div className={styles.heroInner}>
          {/* Title + Subtitle */}
          <h1 className={styles.title}>Word to PPT</h1>
          <p className={styles.subtitle}>
            Transform your Word documents into professional PowerPoint presentations in seconds.
            AI-powered layout generation with high-fidelity formatting.
          </p>

          {/* Drop Zone Card */}
          <div
            className={`${styles.dropzoneCard} ${isDragOver ? styles.dropzoneActive : ''}`}
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
              accept=".doc,.docx"
              multiple
              className={styles.fileInput}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
            <div className={styles.dropIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>upload_file</span>
            </div>
            <p className={styles.dropHeading}>Click or drag &amp; drop Word file</p>
            <p className={styles.dropSub}>Maximum file size: 50MB (.docx, .doc)</p>
            <button type="button" className={styles.selectBtn} tabIndex={-1}>
              Select Files
            </button>
          </div>

          {/* Selected File List */}
          {files.length > 0 && (
            <div className={styles.fileListWrap}>
              <div className={styles.listHeader}>
                <h3 className={styles.listLabel}>Selected Files</h3>
                <button className={styles.clearBtn} onClick={clearAll}>Remove All</button>
              </div>

              <div className={styles.fileList}>
                {files.map(({ file, id }) => (
                  <div key={id} className={styles.fileItem}>
                    <div className={styles.fileItemLeft}>
                      <div className={styles.fileIcon}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>description</span>
                      </div>
                      <div>
                        <p className={styles.fileName} title={file.name}>{file.name}</p>
                        <p className={styles.fileSize}>{formatMB(file.size)}</p>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeFile(id)} aria-label="Remove file">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                  </div>
                ))}
              </div>

              <button className={styles.convertBtn}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Convert to PowerPoint
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <span className={`material-symbols-outlined ${styles.featureIcon}`} style={{ fontSize: 28 }}>bolt</span>
            <h4 className={styles.featureTitle}>Instant Conversion</h4>
            <p className={styles.featureDesc}>Proprietary algorithms parse your document structure to create logical slide breaks and hierarchies instantly.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={`material-symbols-outlined ${styles.featureIcon}`} style={{ fontSize: 28 }}>palette</span>
            <h4 className={styles.featureTitle}>Smart Themes</h4>
            <p className={styles.featureDesc}>Automatically applies professional color palettes and typography pairings that match your document&apos;s tone.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={`material-symbols-outlined ${styles.featureIcon}`} style={{ fontSize: 28 }}>security</span>
            <h4 className={styles.featureTitle}>Privacy First</h4>
            <p className={styles.featureDesc}>Files are encrypted during transit and automatically deleted from our servers 1 hour after conversion.</p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className={styles.seoSection}>
        <div className={styles.seoWrapper}>
          <div>
            <h2 className={styles.seoTitle}>How to turn Word into PPT?</h2>
            <ul className={styles.seoSteps}>
              <li className={styles.seoStep}>
                <div className={styles.stepNum}>1</div>
                <div>
                  <p className={styles.stepTitle}>Upload your .docx file</p>
                  <p className={styles.stepDesc}>Select your Word document from your computer or cloud storage.</p>
                </div>
              </li>
              <li className={styles.seoStep}>
                <div className={styles.stepNum}>2</div>
                <div>
                  <p className={styles.stepTitle}>Configure Conversion</p>
                  <p className={styles.stepDesc}>Choose whether you want a slide per paragraph or a slide per heading.</p>
                </div>
              </li>
              <li className={styles.seoStep}>
                <div className={styles.stepNum}>3</div>
                <div>
                  <p className={styles.stepTitle}>Download Presentation</p>
                  <p className={styles.stepDesc}>Wait a few seconds and your PowerPoint is ready to download.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className={styles.seoVisual}>
            <div className={styles.seoImgOverlay} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <video
              ref={videoRef}
              src="/fileconvert.mp4"
              className={styles.seoImg}
              controls
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div className={styles.playBtnWrap}>
                <button className={styles.playBtn} onClick={togglePlay} aria-label="Play demo video">
                  <span className="material-symbols-outlined" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
