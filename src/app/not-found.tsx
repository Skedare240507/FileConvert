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
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>

        <div className={styles.badge}>
          <span className="material-symbols-outlined">search_off</span>
          Page Not Found
        </div>

        <h1 className={styles.title}>Looks like this page got lost</h1>
        <p className={styles.description}>
          The page you are looking for may have been moved, deleted, or never existed.
          Let&apos;s get you back on track.
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
            <Link href="/convert/pdf-to-word">PDF to Word</Link>
            <Link href="/convert/ppt-to-pdf">PPT to PDF</Link>
            <Link href="/convert/jpg-to-pdf">JPG to PDF</Link>
            <Link href="/convert/excel-to-csv">Excel to CSV</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
