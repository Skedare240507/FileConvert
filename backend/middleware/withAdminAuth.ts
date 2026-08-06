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
import { writeAuditLog } from '@/backend/db/queries/auditLogs';
import type { NextRequest } from 'next/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim());

type AdminHandler = (req: NextRequest, userId: string) => Promise<Response>;

export function withAdminAuth(handler: AdminHandler) {
  return async function (req: NextRequest): Promise<Response> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ADMIN_EMAILS.includes(session.user.email)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Write an audit log for every admin route access
    await writeAuditLog('admin_login', { path: req.nextUrl.pathname }, session.user.id);

    return handler(req, session.user.id);
  };
}
