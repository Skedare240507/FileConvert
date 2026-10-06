/**
 * middleware.ts
 *
 * Generates a cryptographically random nonce for every HTML page request and
 * injects it into a strict Content-Security-Policy header.
 *
 * This replaces the permissive 'unsafe-inline' / 'unsafe-eval' directives for
 * scripts with a per-request nonce so that only scripts Next.js itself emits
 * (which automatically receive the nonce) are allowed to execute inline.
 * Injected attacker scripts — which have no nonce — are blocked by the browser.
 *
 * The nonce is also forwarded to the root layout via the custom request header
 * `x-nonce` so it can be applied to <body nonce={nonce}>, which Next.js uses
 * to stamp all generated <script> tags.
 *
 * Static assets (_next/static, public folder) are excluded from this middleware
 * and fall back to the permissive-but-still-safe CSP set in next.config.mjs.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate a fresh 128-bit nonce for every request (16 bytes → ~24-char base64)
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');

  // Strict nonce-based CSP — no 'unsafe-inline' or 'unsafe-eval' for scripts.
  // 'strict-dynamic' lets scripts loaded by trusted (nonce'd) scripts also run —
  // required for Next.js dynamic chunk imports.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://o4509295826624512.ingest.sentry.io`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com",
    "media-src 'self' blob:",
    "connect-src 'self' https://o4509295826624512.ingest.sentry.io",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    // Prevent <base> tag injection attacks
    "base-uri 'self'",
    // Restrict where forms can submit
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  // Forward the nonce to the root layout via a custom request header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set all security headers on the response
  // (these override the next.config.mjs defaults for HTML pages)
  response.headers.set('Content-Security-Policy',      csp);
  response.headers.set('X-Content-Type-Options',       'nosniff');
  response.headers.set('X-Frame-Options',              'SAMEORIGIN');
  response.headers.set('X-XSS-Protection',             '1; mode=block');
  response.headers.set('Referrer-Policy',              'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security',    'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-DNS-Prefetch-Control',       'on');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes EXCEPT:
     * - _next/static  (compiled JS/CSS bundles)
     * - _next/image   (Next.js image optimisation)
     * - favicon.ico   (browser icon)
     * - Public folder static files (images, fonts, videos, etc.)
     *
     * The `missing` array also excludes Next.js internal prefetch requests
     * so they are not counted as real page hits.
     */
    {
      source:
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|mp3|woff2?|ttf|otf|pdf)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
