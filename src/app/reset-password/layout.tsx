import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | FileConvert',
  description: 'Use FileConvert to process your Reset Password files easily and securely.',
  openGraph: {
    title: 'Reset Password | FileConvert',
    description: 'Use FileConvert to process your Reset Password files easily and securely.',
    url: 'https://fileconvert.example.com/reset-password',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Reset Password | FileConvert', description: 'Use FileConvert to process your Reset Password files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/reset-password' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
