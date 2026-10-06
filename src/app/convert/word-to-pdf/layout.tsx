import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word to PDF Converter — Free Online | FileConvert',
  description: 'Convert Word documents (.docx, .doc) to PDF online for free. Preserve fonts, images, and layout perfectly. No sign-up needed.',
  openGraph: {
    title: 'Word to PDF Converter — Free Online | FileConvert',
    description: 'Convert Word documents to PDF instantly. Free, fast, and secure.',
    url: 'https://fileconvert.example.com/convert/word-to-pdf',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Word to PDF Converter | FileConvert', description: 'Convert Word docs to PDF instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/word-to-pdf' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
