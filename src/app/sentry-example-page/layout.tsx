import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sentry Example Page | FileConvert',
  description: 'Use FileConvert to process your Sentry Example Page files easily and securely.',
  openGraph: {
    title: 'Sentry Example Page | FileConvert',
    description: 'Use FileConvert to process your Sentry Example Page files easily and securely.',
    url: 'https://fileconvert.example.com/sentry-example-page',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Sentry Example Page | FileConvert', description: 'Use FileConvert to process your Sentry Example Page files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/sentry-example-page' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
