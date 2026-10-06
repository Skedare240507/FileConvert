import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word to PPT Converter — Free Online | FileConvert',
  description: 'Convert Word documents (.docx, .doc) to PowerPoint presentations (.pptx) instantly. Free, secure, and no sign-up required.',
  openGraph: {
    title: 'Word to PPT Converter — Free Online | FileConvert',
    description: 'Convert Word documents to PowerPoint presentations instantly. Free, fast, and secure.',
    url: 'https://fileconvert.example.com/convert/word-to-ppt',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Word to PPT Converter — Free Online | FileConvert',
    description: 'Convert Word documents to PowerPoint presentations instantly.',
  },
  alternates: {
    canonical: 'https://fileconvert.example.com/convert/word-to-ppt',
  },
};

export default function WordToPptLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
