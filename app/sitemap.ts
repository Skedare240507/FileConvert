import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://fileconvert.example.com';
  
  const routes = [
    '',
    '/convert/pdf-to-word',
    '/convert/pdf-to-ppt',
    '/convert/pdf-to-jpg',
    '/convert/jpg-to-pdf',
    '/convert/jpg-to-ppt',
    '/convert/excel-to-csv',
    '/convert/csv-to-excel',
    '/convert/ppt-to-pdf',
    '/convert/ppt-to-jpg',
    '/convert/ppt-to-word',
    '/convert/word-to-pdf',
    '/convert/word-to-jpg',
    '/convert/word-to-ppt',
    '/convert/merge',
    '/about',
    '/help',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
