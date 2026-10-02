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
