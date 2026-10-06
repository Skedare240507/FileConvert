import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spreadsheet Tools — Free Online | FileConvert',
  description: 'Convert and manage spreadsheets online. Excel to CSV, CSV to Excel, and more. Free tools with no sign-up required.',
  openGraph: {
    title: 'Spreadsheet Tools — Free Online | FileConvert',
    description: 'All-in-one spreadsheet conversion tools. Free and secure.',
    url: 'https://fileconvert.example.com/convert/spreadsheet',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Spreadsheet Tools | FileConvert', description: 'All-in-one free spreadsheet tools online.' },
  alternates: { canonical: 'https://fileconvert.example.com/convert/spreadsheet' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
