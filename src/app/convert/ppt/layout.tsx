import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PowerPoint Tools — Free Online | FileConvert',
  description: 'All-in-one PowerPoint tools: convert PPT to PDF, JPG, Word, and more. Free online tools with no sign-up required.',
  openGraph: {
    title: 'PowerPoint Tools — Free Online | FileConvert',
    description: 'All-in-one PowerPoint conversion tools. Free and secure.',
    url: 'https://fileconvert.example.com/convert/ppt',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PowerPoint Tools | FileConvert', description: 'All-in-one free PowerPoint tools online.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/ppt' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
