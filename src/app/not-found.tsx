import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you requested was not found.',
};

export default function NotFound() {
  return (
    <>
      <style>{`
        header, footer { display: none !important; }
        main { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; background: #fff; }
      `}</style>
      <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center', marginTop: '-10vh' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111' }}>404 - Page Not Found</h1>
        <p style={{ color: '#333', marginBottom: '2rem' }}>We could not find the page you were looking for.</p>
        <Link href="/" style={{ color: '#0056b3', textDecoration: 'underline' }}>
          Return to Homepage
        </Link>
      </div>
    </>
  );
}
