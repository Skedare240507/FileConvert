import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to PDF Converter — Free Online | FileConvert',
  description: 'Convert JPG images to PDF online for free. Combine multiple JPGs into a single PDF document. No sign-up needed.',
  openGraph: {
    title: 'JPG to PDF Converter — Free Online | FileConvert',
    description: 'Convert JPG images to a PDF document instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/jpg-to-pdf',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'JPG to PDF Converter | FileConvert', description: 'Convert JPG images to PDF instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/jpg-to-pdf' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
