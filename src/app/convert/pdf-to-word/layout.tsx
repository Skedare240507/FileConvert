import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Word Converter — Free Online | FileConvert',
  description: 'Convert PDF files to editable Word documents (.docx) online. Preserve formatting, tables, and images. Free and secure.',
  openGraph: {
    title: 'PDF to Word Converter — Free Online | FileConvert',
    description: 'Convert PDF to editable Word documents instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/pdf-to-word',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PDF to Word Converter | FileConvert', description: 'Convert PDF to editable Word docs instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/pdf-to-word' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
