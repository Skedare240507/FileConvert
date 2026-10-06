import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word to JPG Converter — Free Online | FileConvert',
  description: 'Convert Word documents (.docx, .doc) to JPG images online. Every page becomes a high-resolution image. Free and instant.',
  openGraph: {
    title: 'Word to JPG Converter — Free Online | FileConvert',
    description: 'Convert Word documents to JPG images online. Free, fast, and secure.',
    url: 'https://fileconvert.example.com/convert/word-to-jpg',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Word to JPG Converter | FileConvert', description: 'Convert Word docs to JPG images instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/word-to-jpg' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
