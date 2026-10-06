import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PPT to PDF Converter — Free Online | FileConvert',
  description: 'Convert PowerPoint presentations (.pptx, .ppt) to PDF online. Perfectly formatted, high-fidelity output. Free and instant.',
  openGraph: {
    title: 'PPT to PDF Converter — Free Online | FileConvert',
    description: 'Convert PowerPoint to PDF instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/ppt-to-pdf',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PPT to PDF Converter | FileConvert', description: 'Convert PowerPoint to PDF instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/ppt-to-pdf' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
