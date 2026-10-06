import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merge PDF Files — Free Online | FileConvert',
  description: 'Merge multiple PDF files into one online. Reorder, combine, and download your PDFs in seconds. Free, secure, no sign-up.',
  openGraph: {
    title: 'Merge PDF Files — Free Online | FileConvert',
    description: 'Merge multiple PDF files into one document instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/merge',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Merge PDF Files | FileConvert', description: 'Merge PDFs into one document instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/merge' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
