import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word Tools — Free Online | FileConvert',
  description: 'All-in-one Word document tools: convert DOCX to PDF, PPT, JPG, and more. Free online tools with no sign-up required.',
  openGraph: {
    title: 'Word Tools — Free Online | FileConvert',
    description: 'All-in-one Word document conversion tools. Free and secure.',
    url: 'https://fileconvert.example.com/convert/word',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Word Tools | FileConvert', description: 'All-in-one free Word document tools online.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/word' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
