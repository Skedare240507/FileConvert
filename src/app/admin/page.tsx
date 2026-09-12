import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/backend/db/client';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';

/**
 * Admin Panel Server Guard.
 * Strict zero-trust authentication:
 * 1. Session exists and has user id and email.
 * 2. User is present in database with role === 'admin'.
 * 3. Account is not locked.
 * 4. User email is in ADMIN_EMAILS environment variable.
 *
 * If ANY condition fails, triggers notFound() (404), completely cloaking
 * the admin dashboard from unauthorized users and automated scanners.
 */
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  const userId = session?.user?.id;

  if (!session?.user || !email || !userId) {
    notFound();
  }

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!ADMIN_EMAILS.includes(email)) {
    notFound();
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, lockedUntil: true },
  });

  const isLocked = dbUser?.lockedUntil && new Date(dbUser.lockedUntil) > new Date();
  if (!dbUser || dbUser.role !== 'admin' || isLocked) {
    notFound();
  }

  return <AdminDashboardClient userEmail={email} />;
}
