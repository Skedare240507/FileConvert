import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | FileConvert',
  description: 'Use FileConvert to process your Admin files easily and securely.',
  openGraph: {
    title: 'Admin | FileConvert',
    description: 'Use FileConvert to process your Admin files easily and securely.',
    url: 'https://fileconvert.example.com/admin',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Admin | FileConvert', description: 'Use FileConvert to process your Admin files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/admin' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
