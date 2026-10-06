import { withSentryConfig } from '@sentry/nextjs/config';
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  // bullmq and ioredis use Node.js-only CJS internals that Turbopack cannot
  // bundle. Externalising them makes Next.js load them via native require()
  // at runtime instead, which fixes:
  //   TypeError: (void 0) is not a constructor  (Queue from bullmq)
  serverExternalPackages: ['bullmq', 'ioredis'],
  turbopack: {
    // Turbopack picks the "module" (ESM) field from bullmq's package.json which
    // uses native `export *` re-exports on top of Node.js-only internals it
    // cannot bundle. Force it to the CJS build instead.
    resolveAlias: {
      bullmq: 'bullmq/dist/cjs/index.js',
    },
  },
  // Security headers applied to ALL routes (including static assets).
  // The Content-Security-Policy here is a permissive fallback for static routes
  // that bypass the middleware (e.g. _next/static, public folder).
  // For HTML pages the middleware (src/middleware.ts) overrides this header
  // with a strict nonce-based CSP — eliminating 'unsafe-inline' for scripts.
  async headers() {
    const cspFallback = [
      "default-src 'self'",
      // Fallback allows 'unsafe-inline' only for static routes — the middleware
      // replaces this with a nonce-based version for every HTML page response.
      "script-src 'self' 'unsafe-inline' https://o4509295826624512.ingest.sentry.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://o4509295826624512.ingest.sentry.io",
      "frame-src 'none'",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing attacks
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          // Block clickjacking / iframe embedding from other origins
          { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
          // Enable legacy XSS filter (older browsers)
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          // Control referrer information sent with requests
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          // Restrict browser features — no camera, mic, geolocation
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Fallback CSP — overridden per-request with nonce by middleware.ts
          { key: 'Content-Security-Policy', value: cspFallback },
          // HSTS — enforce HTTPS for 1 year, include subdomains
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // DNS prefetch control
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "none-pi",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
