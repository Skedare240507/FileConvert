import './globals.css';
import styles from './layout.module.css';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';

const Header = dynamic(() => import('../components/Header'), { ssr: true });
import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://fileconvert.example.com'),
  title: 'FileConvert - Fast & Free Document Converter',
  description: 'Convert, merge, and manage documents across PDF, Word, JPG, Excel, CSV, and PowerPoint formats for free.',
  openGraph: {
    title: 'FileConvert - Fast & Free Document Converter',
    description: 'Convert, merge, and manage documents across PDF, Word, JPG, Excel, CSV, and PowerPoint formats for free.',
    url: 'https://fileconvert.example.com',
    siteName: 'FileConvert',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FileConvert Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'FileConvert - Fast & Free Document Converter',
    description: 'Convert, merge, and manage documents across PDF, Word, JPG, Excel, CSV, and PowerPoint formats for free.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body>
        <Providers>
          <NextTopLoader
            color="#00685f"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
          />
          <Header />

          <main>{children}</main>

          <footer className={styles.footer}>
            <div className={styles.footerContainer}>

              {/* Left: Branding */}
              <div className={styles.footerBrand}>
                <p className={styles.copyright}>© 2026 FileConvert. Premium<br />Document Utility.</p>
                <a href="#" className={styles.footerGlobe} aria-label="Website">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              </div>

              {/* PDF Tools */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>PDF Tools</h4>
                <a href="/convert/pdf-to-word">PDF to Word</a>
                <a href="/convert/pdf-to-ppt">PDF to PPT</a>
                <a href="/convert/pdf-to-jpg">PDF to JPG</a>
              </div>

              {/* Image Tools */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Image Tools</h4>
                <a href="/convert/jpg-to-pdf">JPG to PDF</a>
                <a href="/convert/jpg-to-ppt">JPG to PPT</a>
                <a href="/convert/image">All Image Tools</a>
              </div>

              {/* Spreadsheet Tools */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Spreadsheet Tools</h4>
                <a href="/convert/excel-to-csv">Excel to CSV</a>
                <a href="/convert/csv-to-excel">CSV to Excel</a>
                <a href="/convert/spreadsheet">All Spreadsheet Tools</a>
              </div>

              {/* PPT Tools */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>PPT Tools</h4>
                <a href="/convert/ppt-to-pdf">Ppt to Pdf</a>
                <a href="/convert/ppt-to-jpg">Ppt to Jpg</a>
                <a href="/convert/ppt-to-word">Ppt to Word</a>
              </div>
              {/* Word Tools */}
<div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Word Tools</h4>
                <a href="/convert/word-to-pdf">Word to Pdf</a>
                <a href="/convert/word-to-jpg">Word to Jpg</a>
                <a href="/convert/word-to-ppt">Word to Ppt</a>
              </div>
              {/* Company */}
              <div className={styles.footerCol}>
                <h4 className={styles.footerColTitle}>Company</h4>
                <a href="/about">About Us</a>
                <a href="/help">Support</a>
                <a href="/privacy">Privacy Policy</a>
              </div>

            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
