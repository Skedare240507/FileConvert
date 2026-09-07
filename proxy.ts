import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy Convention (formerly middleware).
 * Handles Edge routing, admin cloaking with 404, and cyber defense HTTP headers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Zero-Trust Admin Cloaking
  // If requesting /admin or /api/admin without a session cookie, rewrite immediately to /404.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const hasAuthToken =
      request.cookies.has('next-auth.session-token') ||
      request.cookies.has('__Secure-next-auth.session-token');

    if (!hasAuthToken) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  const response = NextResponse.next();

  // 2. Strict Security Headers against Cyber Attacks
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https://*.backblazeb2.com;
    connect-src 'self' https://*.backblazeb2.com;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
