import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | FileConvert',
  description: 'Use FileConvert to process your Forgot Password files easily and securely.',
  openGraph: {
    title: 'Forgot Password | FileConvert',
    description: 'Use FileConvert to process your Forgot Password files easily and securely.',
    url: 'https://fileconvert.example.com/forgot-password',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Forgot Password | FileConvert', description: 'Use FileConvert to process your Forgot Password files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/forgot-password' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
