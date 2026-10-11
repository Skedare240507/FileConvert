import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * proxy.ts  (Next.js 16+ convention — replaces the deprecated middleware.ts)
 *
 * Responsibilities:
 *   1. Zero-Trust Admin Cloaking  — unauthenticated /admin or /api/admin
 *      requests are immediately rewritten to /404 (no redirect, no leaking).
 *
 *   2. Per-request Nonce-based CSP — generates a fresh 128-bit nonce for every
 *      HTML page request and injects it into a strict Content-Security-Policy.
 *        PRODUCTION : nonce + strict-dynamic (no unsafe-inline / unsafe-eval for scripts)
 *        DEVELOPMENT: also allows unsafe-eval  (required by React/Turbopack for
 *                     HMR, callstack reconstruction, and dev-mode debugging)
 *      The nonce is forwarded to the root layout via the `x-nonce` request
 *      header so Next.js can stamp it onto all generated <script> tags.
 *
 *   3. Strict Security Headers — HSTS, X-Frame-Options, CSP, Referrer-Policy, etc.
 *
 * Static assets (_next/static, public folder) are excluded via the matcher
 * below and fall back to the headers set in next.config.mjs.
 */

const isDev = process.env.NODE_ENV === 'development';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Zero-Trust Admin Cloaking ────────────────────────────────────────────
  // Rewrite to /404 for unauthenticated admin routes — no redirect, no hint.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const hasAuthToken =
      request.cookies.has('next-auth.session-token') ||
      request.cookies.has('__Secure-next-auth.session-token');

    if (!hasAuthToken) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // ── 2. Generate nonce ────────────────────────────────────────────────────────
  // 16 random bytes → ~24-char base64 string — fresh for every request
  const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');

  // ── 3. Build nonce-based CSP ─────────────────────────────────────────────────
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://o4509295826624512.ingest.sentry.io`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://o4509295826624512.ingest.sentry.io`;

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.backblazeb2.com",
    "media-src 'self' blob:",
    "connect-src 'self' https://o4509295826624512.ingest.sentry.io https://*.backblazeb2.com",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  // ── 4. Forward nonce to root layout via request header ───────────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // ── 5. Set all security headers on the response ──────────────────────────────
  response.headers.set('Content-Security-Policy',   csp);
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options',           'DENY');
  response.headers.set('X-Content-Type-Options',    'nosniff');
  response.headers.set('X-XSS-Protection',          '1; mode=block');
  response.headers.set('Referrer-Policy',           'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control',    'on');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all routes EXCEPT:
     *   - _next/static  (compiled JS/CSS bundles)
     *   - _next/image   (Next.js image optimisation)
     *   - favicon.ico
     *   - Public static files (images, fonts, videos, PDFs, etc.)
     *
     * The `missing` array excludes Next.js internal prefetch requests.
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

