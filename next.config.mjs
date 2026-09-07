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

export default nextConfig;
