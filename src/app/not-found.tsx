import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 — Page Not Found | FileConvert',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      {/* Ambient blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      {/* Floating document icons */}
      <div className={styles.floatingIcons}>
        <div className={`${styles.docIcon} ${styles.docIconPdf}`}>
          <span className="material-symbols-outlined">picture_as_pdf</span>
          <span className={styles.docLabel}>PDF</span>
        </div>
        <div className={`${styles.docIcon} ${styles.docIconDocx}`}>
          <span className="material-symbols-outlined">description</span>
          <span className={styles.docLabel}>DOCX</span>
        </div>
        <div className={`${styles.docIcon} ${styles.docIconJpg}`}>
          <span className="material-symbols-outlined">image</span>
          <span className={styles.docLabel}>JPG</span>
        </div>
        <div className={`${styles.docIcon} ${styles.docIconPpt}`}>
          <span className="material-symbols-outlined">slideshow</span>
          <span className={styles.docLabel}>PPT</span>
        </div>
        <div className={`${styles.docIcon} ${styles.docIconXls}`}>
          <span className="material-symbols-outlined">table_chart</span>
          <span className={styles.docLabel}>XLS</span>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>

        <div className={styles.badge}>
          <span className="material-symbols-outlined">search_off</span>
          Page Not Found
        </div>

        <h1 className={styles.title}>Looks like this page got lost in conversion</h1>
        <p className={styles.description}>
          The page you are looking for may have been moved, deleted, or never existed.
          Let&apos;s get you back to converting documents.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            <span className="material-symbols-outlined">home</span>
            Go Home
          </Link>
          <Link href="/convert/pdf" className={styles.btnOutline}>
            <span className="material-symbols-outlined">apps</span>
            Browse Tools
          </Link>
        </div>

        <div className={styles.suggestions}>
          <p className={styles.suggestionsLabel}>Popular tools:</p>
          <div className={styles.suggestionLinks}>
            <Link href="/convert/pdf-to-word">PDF → Word</Link>
            <Link href="/convert/ppt-to-pdf">PPT → PDF</Link>
            <Link href="/convert/jpg-to-pdf">JPG → PDF</Link>
            <Link href="/convert/excel-to-csv">Excel → CSV</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
