import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSV to Excel Converter — Free Online | FileConvert',
  description: 'Convert CSV files to Excel spreadsheets (.xlsx) online for free. Preserve all data and formatting. No sign-up required.',
  openGraph: {
    title: 'CSV to Excel Converter — Free Online | FileConvert',
    description: 'Convert CSV files to Excel spreadsheets instantly. Free and secure.',
    url: 'https://fileconvert.example.com/convert/csv-to-excel',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'CSV to Excel Converter | FileConvert', description: 'Convert CSV to Excel instantly.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/csv-to-excel' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
