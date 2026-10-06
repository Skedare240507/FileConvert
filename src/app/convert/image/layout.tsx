import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Converter — Free Online | FileConvert',
  description: 'Convert images between JPG, PNG, WebP, and more online. Free, fast, and high-quality image conversion. No sign-up required.',
  openGraph: {
    title: 'Image Converter — Free Online | FileConvert',
    description: 'Convert images between formats instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/image',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Image Converter | FileConvert', description: 'Convert images between formats instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/image' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
