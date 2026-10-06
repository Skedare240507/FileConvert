import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to PPT Converter — Free Online | FileConvert',
  description: 'Convert PDF files to PowerPoint presentations (.pptx) online for free. Each PDF page becomes an editable slide.',
  openGraph: {
    title: 'PDF to PPT Converter — Free Online | FileConvert',
    description: 'Convert PDF to PowerPoint slides instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/pdf-to-ppt',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PDF to PPT Converter | FileConvert', description: 'Convert PDF to PowerPoint slides instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/pdf-to-ppt' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
