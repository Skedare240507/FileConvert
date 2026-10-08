import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | FileConvert',
  description: 'Use FileConvert to process your Login files easily and securely.',
  openGraph: {
    title: 'Login | FileConvert',
    description: 'Use FileConvert to process your Login files easily and securely.',
    url: 'https://fileconvert.example.com/login',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Login | FileConvert', description: 'Use FileConvert to process your Login files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/login' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
