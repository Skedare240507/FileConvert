import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy | FileConvert',
  description: 'Use FileConvert to process your Privacy files easily and securely.',
  openGraph: {
    title: 'Privacy | FileConvert',
    description: 'Use FileConvert to process your Privacy files easily and securely.',
    url: 'https://fileconvert.example.com/privacy',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Privacy | FileConvert', description: 'Use FileConvert to process your Privacy files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/privacy' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
