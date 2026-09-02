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
  const createData: any = {
    file_type: data.fileType,
    file_count: data.fileCount,
    status: 'queued',
  };
  if (data.userId) createData.user_id = data.userId;

  return prisma.mergeSession.create({
    data: createData,
  });
}

export async function getMergeSessionById(sessionId: string, userId?: string | null) {
  const whereData: any = { id: sessionId };
  if (userId) whereData.user_id = userId;

  return prisma.mergeSession.findFirst({
    where: whereData,
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
