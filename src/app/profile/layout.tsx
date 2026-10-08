import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | FileConvert',
  description: 'Use FileConvert to process your Profile files easily and securely.',
  openGraph: {
    title: 'Profile | FileConvert',
    description: 'Use FileConvert to process your Profile files easily and securely.',
    url: 'https://fileconvert.example.com/profile',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Profile | FileConvert', description: 'Use FileConvert to process your Profile files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/profile' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
