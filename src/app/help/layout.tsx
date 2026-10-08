import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help | FileConvert',
  description: 'Use FileConvert to process your Help files easily and securely.',
  openGraph: {
    title: 'Help | FileConvert',
    description: 'Use FileConvert to process your Help files easily and securely.',
    url: 'https://fileconvert.example.com/help',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Help | FileConvert', description: 'Use FileConvert to process your Help files easily and securely.' },
  alternates: { canonical: 'https://fileconvert.example.com/help' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
