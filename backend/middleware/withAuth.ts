/**
 * middleware/withAuth.ts
 *
 * Session-aware middleware wrapper for Next.js API route handlers.
 *
 * Usage:
 *   export const POST = withAuth(async (req, { session, plan }) => { ... });
 *
 * - Returns HTTP 401 if no valid session is found.
 * - Attaches the resolved plan tier to the request context so handlers can
 *   enforce limits without making additional DB calls.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getUserById } from '@/backend/db/queries/users';
import type { NextRequest } from 'next/server';
import type { Plan } from '@/backend/config/constants';

export interface AuthContext {
  userId: string;
  email: string;
  plan: Plan;
}

type AuthedHandler = (
  req: NextRequest,
  ctx: AuthContext
) => Promise<Response>;

export function withAuth(handler: AuthedHandler) {
  return async function (req: NextRequest): Promise<Response> {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve the current plan from the DB (the session may be stale)
    const user = await getUserById(session.user.id);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    const plan = ((user as unknown as { plan?: string }).plan ?? 'free') as Plan;

    return handler(req, {
      userId: user.id,
      email: user.email ?? session.user.email,
      plan,
    });
  };
}
