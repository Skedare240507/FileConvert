import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signup | FileConvert',
  description: 'Use FileConvert to process your Signup files easily and securely.',
  openGraph: {
    title: 'Signup | FileConvert',
    description: 'Use FileConvert to process your Signup files easily and securely.',
    url: 'https://fileconvert.example.com/signup',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Signup | FileConvert', description: 'Use FileConvert to process your Signup files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/signup' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
