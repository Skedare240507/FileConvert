import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow all well-behaved crawlers to index public pages
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // All API routes — never index these
          '/admin/',        // Admin dashboard
          '/dashboard/',    // User dashboard (private)
          '/profile/',      // User profile pages (private)
          '/login',         // Auth pages
          '/signup',        // Auth pages
          '/forgot-password',
          '/reset-password',
          '/monitoring',    // Sentry tunnel route
          '/sentry-example-page/', // Sentry debug page
          '/_next/',        // Next.js internals
          '/error',         // Error pages
        ],
      },
      {
        // Block AI training crawlers from indexing any content
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Omgilibot',
          'FacebookBot',
        ],
        disallow: '/',
      },
      {
        // Block known bad bots
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: 'https://fileconvert.example.com/sitemap.xml',
    host: 'https://fileconvert.example.com',
  };
}
