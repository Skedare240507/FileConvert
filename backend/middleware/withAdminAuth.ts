/**
 * middleware/withAdminAuth.ts
 *
 * Admin-only route guard.
 *
 * Checks that the authenticated user has admin role, and writes an audit log
 * entry on every access. Admin role is currently stored as a hardcoded email
 * list in the environment; a proper `role` column should be added to the
 * users table before the admin dashboard goes to production.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/backend/db/client';
import { logger } from '@/backend/utils/logger';
import type { NextRequest } from 'next/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type AdminHandler = (req: NextRequest, userId: string) => Promise<Response>;

/**
 * Zero-Trust Admin Guard with Route Cloaking.
 * Any non-admin access returns 404 Not Found (not 401/403) so attackers
 * cannot confirm the existence of admin endpoints.
 */
export function withAdminAuth(handler: AdminHandler) {
  return async function (req: NextRequest): Promise<Response> {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email?.toLowerCase();
    const userId = session?.user?.id;

    if (!session?.user || !userEmail || !userId) {
      logger.warn('Unauthorized admin route probe - returned 404', { ip: req.headers.get('x-forwarded-for'), path: req.nextUrl.pathname });
      return Response.json({ error: 'Not Found' }, { status: 404 });
    }

    // Verify against DB to ensure role hasn't been revoked and account isn't locked
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, lockedUntil: true },
    });

    const isLocked = dbUser?.lockedUntil && new Date(dbUser.lockedUntil) > new Date();
    const isWhitelisted = ADMIN_EMAILS.includes(userEmail);
    const hasAdminRole = dbUser?.role === 'admin';

    if (!hasAdminRole || !isWhitelisted || isLocked) {
      logger.warn('Forbidden admin route access attempt - returned 404', { userId, userEmail, path: req.nextUrl.pathname });
      return Response.json({ error: 'Not Found' }, { status: 404 });
    }

    logger.info('Admin accessed privileged route', { userId, userEmail, path: req.nextUrl.pathname });
    return handler(req, userId);
  };
}
