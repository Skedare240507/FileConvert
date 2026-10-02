"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center', marginTop: '15vh' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111' }}>500 - Application Error</h1>
          <p style={{ color: '#333', marginBottom: '2rem' }}>A critical error occurred.</p>
          <button onClick={reset} style={{ color: '#0056b3', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
            Reload App
          </button>
        </div>
      </body>
    </html>
  );
}
