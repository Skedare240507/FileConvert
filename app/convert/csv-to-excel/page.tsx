'use client';

import React, { useState, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface SelectedFile {
  file: File;
  id: string;
}

export default function CsvToExcel() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles).map(file => ({
      file,
      id: Math.random().toString(36).substring(7)
    }));
    setFiles(prev => [...prev, ...filesArray]);
  }, []);

  const removeFile = (idToRemove: string) => {
    setFiles(prev => prev.filter(f => f.id !== idToRemove));
  };

  const clearAll = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTmCB0Vap__mtB23RXygx2XvH2GfHCtD9p5_gB8771u2bCjmDmtUk0va7r6blkc3_8bV4-TtPIylUm5GXns474cV08B5LcTOsVRmvTZkP-PoyfSjgfoY9PuKZBljSzyKSmunXh8JS_8E5-bvan_dKNv0K5cbbeWE3PkUvTTuow-kVdjgStLbRSG2z7qgPZUmS7tDKeoWSAjiNfo679UqtbZWhfsuZmOkYhm7y7hld0ZkOR8AY21xlR10uijjUz3xUj8RUK8pa57g"
          alt="Workspace"
          className={styles.heroBg}
        />
        <div className={styles.heroOverlay} />
        
        <div className={styles.heroContent}>
          <h1 className={styles.title}>CSV to Excel</h1>
          <p className={styles.subtitle}>
            Convert your comma-separated values (CSV) into professional Excel spreadsheets (.xlsx) instantly while maintaining all data formatting and structure.
          </p>

          <div className={`${styles.workspace} ${isDragOver ? styles.workspaceActive : ''}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
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
            <div className={styles.dropContent}>
              <div className={styles.dropIconWrap}>
                <span className="material-symbols-outlined" style={{ fontSize: 40 }}>upload_file</span>
              </div>
              <div>
                <h3 className={styles.dropHeading}>Drop CSV files here</h3>
                <p className={styles.dropSub}>or click to browse your local storage</p>
              </div>
              <div className={styles.cloudButtons}>
                <button type="button" className={styles.cloudBtn} onClick={(e) => e.stopPropagation()}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cloud</span> Google Drive
                </button>
                <button type="button" className={styles.cloudBtn} onClick={(e) => e.stopPropagation()}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>folder</span> Dropbox
                </button>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className={styles.selectedFiles}>
              <h4 className={styles.selectedHeader}>Selected Files</h4>
              <div className={styles.fileList}>
                {files.map(({ file, id }) => (
                  <div key={id} className={styles.fileItem}>
                    <div className={styles.fileItemLeft}>
                      <div className={styles.fileIcon}>
                        <span className="material-symbols-outlined">table_chart</span>
                      </div>
                      <div>
                        <p className={styles.fileName}>{file.name}</p>
                        <p className={styles.fileSize}>{formatBytes(file.size)} • Ready to convert</p>
                      </div>
                    </div>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => removeFile(id)}
                      aria-label="Remove file"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className={styles.actionRow}>
                <button className={styles.clearBtn} onClick={clearAll}>Clear All</button>
                <button className={styles.convertBtn}>
                  Convert to Excel
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>security</span>
            </div>
            <h3 className={styles.featureTitle}>Privacy First</h3>
            <p className={styles.featureDesc}>Your files are processed using 256-bit SSL encryption and automatically deleted from our servers after 2 hours.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>bolt</span>
            </div>
            <h3 className={styles.featureTitle}>Instant Processing</h3>
            <p className={styles.featureDesc}>Our high-performance engines convert complex CSV data to Excel in seconds, no matter how large the file.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>architecture</span>
            </div>
            <h3 className={styles.featureTitle}>Preserve Structure</h3>
            <p className={styles.featureDesc}>Maintain your delimiters, data types, and character encoding perfectly during the transformation process.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
