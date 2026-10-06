import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG Converter — Free Online | FileConvert',
  description: 'Convert every PDF page to a high-resolution JPG image online. Up to 300 DPI. Free, fast, and secure — no sign-up required.',
  openGraph: {
    title: 'PDF to JPG Converter — Free Online | FileConvert',
    description: 'Convert PDF pages to high-resolution JPG images. Free and secure.',
    url: 'https://fileconvert.example.com/convert/pdf-to-jpg',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PDF to JPG Converter | FileConvert', description: 'Convert PDF pages to JPG images instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/pdf-to-jpg' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
