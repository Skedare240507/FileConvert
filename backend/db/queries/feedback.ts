/**
 * db/queries/feedback.ts
 *
 * Typed query helpers for the `feedback` table.
 */

import { prisma } from '../client';

export async function createFeedback(data: {
  name: string;
  email: string;
  message: string;
  category: 'bug' | 'feature' | 'billing' | 'other';
}) {
  return prisma.feedback.create({ data });
}

export async function listFeedback(status?: 'open' | 'resolved') {
  return prisma.feedback.findMany({
    where: status ? { status } : undefined,
    orderBy: { created_at: 'desc' },
  });
}

export async function resolveFeedback(id: string) {
  return prisma.feedback.update({
    where: { id },
    data: { status: 'resolved' },
  });
}
