/**
 * db/queries/users.ts
 *
 * Typed query helpers for the `users` table.
 * API routes should call these instead of writing raw prisma calls inline.
 */

import { prisma } from '../client';
import type { Plan } from '@/backend/config/constants';

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function updateUserPlan(userId: string, plan: Plan) {
  return prisma.user.update({
    where: { id: userId },
    data: { plan } as never, // plan is not on the Prisma model yet — add after migration
  });
}

export async function incrementFailedLoginAttempts(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
  });
}

export async function lockUserAccount(userId: string, until: Date) {
  return prisma.user.update({
    where: { id: userId },
    data: { lockedUntil: until, failedLoginAttempts: 0 },
  });
}

export async function resetFailedLoginAttempts(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}
