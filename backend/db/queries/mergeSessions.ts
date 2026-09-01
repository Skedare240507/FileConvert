/**
 * db/queries/mergeSessions.ts
 *
 * Typed query helpers for the `merge_sessions` table.
 */

import { prisma } from '../client';

export async function createMergeSession(data: {
  userId: string | null;
  fileType: 'pdf' | 'word' | 'ppt';
  fileCount: number;
}) {
  return prisma.mergeSession.create({
    data: {
      user_id: data.userId,
      file_type: data.fileType,
      file_count: data.fileCount,
      status: 'queued',
    },
  });
}

export async function getMergeSessionById(sessionId: string, userId?: string | null) {
  return prisma.mergeSession.findFirst({
    where: { 
      id: sessionId,
      ...(userId !== undefined && { user_id: userId })
    },
  });
}

export async function updateMergeSessionStatus(
  sessionId: string,
  status: string,
  r2OutputKey?: string
) {
  return prisma.mergeSession.update({
    where: { id: sessionId },
    data: {
      status,
      ...(r2OutputKey && { r2_output_key: r2OutputKey }),
    },
  });
}
