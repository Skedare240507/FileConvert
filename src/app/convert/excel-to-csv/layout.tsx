import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Excel to CSV Converter — Free Online | FileConvert',
  description: 'Convert Excel spreadsheets (.xlsx, .xls) to CSV format online for free. Preserve data accurately. No sign-up required.',
  openGraph: {
    title: 'Excel to CSV Converter — Free Online | FileConvert',
    description: 'Convert Excel spreadsheets to CSV format instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/excel-to-csv',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Excel to CSV Converter | FileConvert', description: 'Convert Excel to CSV instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/excel-to-csv' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
