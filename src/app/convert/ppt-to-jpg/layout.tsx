import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PPT to JPG Converter — Free Online | FileConvert',
  description: 'Convert PowerPoint slides (.pptx, .ppt) to JPG images online. Each slide becomes a crisp, high-resolution image. Free.',
  openGraph: {
    title: 'PPT to JPG Converter — Free Online | FileConvert',
    description: 'Convert PowerPoint slides to JPG images instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/ppt-to-jpg',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'PPT to JPG Converter | FileConvert', description: 'Convert PowerPoint slides to JPG images.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/ppt-to-jpg' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
