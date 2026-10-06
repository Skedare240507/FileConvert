import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PPT to Word Converter — Free Online | FileConvert',
  description: 'Convert PowerPoint presentations (.pptx, .ppt) to editable Word documents (.docx) online. Free, fast, and secure.',
  openGraph: {
    title: 'PPT to Word Converter — Free Online | FileConvert',
    description: 'Convert PowerPoint to Word documents instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/ppt-to-word',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PPT to Word Converter | FileConvert', description: 'Convert PowerPoint to Word documents instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/ppt-to-word' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
