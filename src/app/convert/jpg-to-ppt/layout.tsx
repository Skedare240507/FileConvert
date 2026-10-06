import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to PPT Converter — Free Online | FileConvert',
  description: 'Convert JPG images to PowerPoint presentations (.pptx) online. Each image becomes a slide. Free, fast, and secure.',
  openGraph: {
    title: 'JPG to PPT Converter — Free Online | FileConvert',
    description: 'Convert JPG images to PowerPoint slides instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/jpg-to-ppt',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'JPG to PPT Converter | FileConvert', description: 'Convert JPG images to PowerPoint slides instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/jpg-to-ppt' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
