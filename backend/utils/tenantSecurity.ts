import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { NextRequest } from 'next/server';

export interface TenantIdentity {
  userId: string | null;
  anonToken: string | null;
  isAdmin: boolean;
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Resolves the calling actor's identity:
 * - Authenticated user ID & admin status
 * - Anonymous guest token from httpOnly cookie
 */
export async function resolveTenantIdentity(req: NextRequest): Promise<TenantIdentity> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const userEmail = session?.user?.email?.toLowerCase() ?? '';
  const isAdmin = Boolean(userId && ADMIN_EMAILS.includes(userEmail));
  const anonToken = req.cookies.get('fc_anon_id')?.value ?? null;

  return { userId, anonToken, isAdmin };
}

/**
 * Enforces strict multi-tenant ownership:
 * - Admin has override access.
 * - Authenticated jobs require matching user_id.
 * - Guest jobs require matching anon_token cookie.
 * - Prevents IDOR and cross-account data tampering.
 */
export function canAccessResource(
  owner: { user_id: string | null; anon_token?: string | null },
  identity: TenantIdentity
): boolean {
  if (identity.isAdmin) return true;

  if (owner.user_id) {
    return Boolean(identity.userId && identity.userId === owner.user_id);
  }

  if (owner.anon_token) {
    return Boolean(identity.anonToken && identity.anonToken === owner.anon_token);
  }

  // Legacy records without ownership are denied to unauthenticated callers
  return false;
}
