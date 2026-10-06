import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Tools — Free Online | FileConvert',
  description: 'All-in-one PDF tools: convert, merge, compress, and more. Free online PDF tools with no sign-up required.',
  openGraph: {
    title: 'PDF Tools — Free Online | FileConvert',
    description: 'All-in-one PDF tools: convert, merge, compress, and more.',
    url: 'https://fileconvert.example.com/convert/pdf',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PDF Tools | FileConvert', description: 'All-in-one free PDF tools online.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/pdf' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
