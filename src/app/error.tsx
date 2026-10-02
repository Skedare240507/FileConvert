"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./error.module.css";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[FileConvert] Runtime error:", error);
  }, [error]);

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>
            error_outline
          </span>
          <div className={styles.iconRing} />
        </div>

        <div className={styles.badge}>
          <span className="material-symbols-outlined">warning</span>
          Something went wrong
        </div>

        <div className={styles.errorCode}>500</div>
        <h1 className={styles.title}>An unexpected error occurred</h1>
        <p className={styles.description}>
          We hit a snag on our end. Our team has been notified and is working on a fix.
          You can try again or head back home.
        </p>

        {error?.digest && (
          <div className={styles.digestBox}>
            <span className="material-symbols-outlined">tag</span>
            Error ID: <code>{error.digest}</code>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={reset} className={styles.btnPrimary}>
            <span className="material-symbols-outlined">refresh</span>
            Try Again
          </button>
          <Link href="/" className={styles.btnOutline}>
            <span className="material-symbols-outlined">home</span>
            Go Home
          </Link>
        </div>

        <Link href="/help" className={styles.helpLink}>
          <span className="material-symbols-outlined">support_agent</span>
          Contact support if this keeps happening
        </Link>
      </div>
    </div>
  );
}
