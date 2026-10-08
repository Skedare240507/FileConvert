import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | FileConvert',
  description: 'Use FileConvert to process your Dashboard files easily and securely.',
  openGraph: {
    title: 'Dashboard | FileConvert',
    description: 'Use FileConvert to process your Dashboard files easily and securely.',
    url: 'https://fileconvert.example.com/dashboard',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Dashboard | FileConvert', description: 'Use FileConvert to process your Dashboard files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/dashboard' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
