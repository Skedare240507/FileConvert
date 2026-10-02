"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center', marginTop: '15vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111' }}>500 - Internal Server Error</h1>
      <p style={{ color: '#333', marginBottom: '2rem' }}>Sorry, something went wrong on our end.</p>
      <button onClick={reset} style={{ color: '#0056b3', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
        Try Again
      </button>
      <br /><br />
      <Link href="/" style={{ color: '#0056b3', textDecoration: 'underline' }}>
        Return to Homepage
      </Link>
    </div>
  );
}
