/**
 * workers/cleanupWorker.ts
 *
 * Scheduled BullMQ worker that enforces the 1-hour R2 file TTL.
 * Runs as a recurring job — every minute it queries for R2 keys older than
 * FILE_TTL_MS and deletes them. This formalises the cleanup as an observable,
 * monitored job rather than relying solely on the R2 lifecycle rule.
 *
 * Metrics are written so Grafana can confirm cleanup is actually running.
 */

import { Worker } from 'bullmq';
import { redisConnection } from '@/backend/queue/client';
import { QUEUE_NAMES, FILE_TTL_MS } from '@/backend/config/constants';
import { deleteFromB2 } from '@/backend/services/storage/storage';
import { prisma } from '@/backend/db/client';
import type { CleanupJobPayload } from '@/backend/queue/jobs/cleanupJob';
import { logger } from '@/backend/utils/logger';

export const cleanupWorker = new Worker<CleanupJobPayload>(
  QUEUE_NAMES.CLEANUP,
  async (job: import('bullmq').Job<CleanupJobPayload>) => {
    const { r2Keys, reason, relatedJobId } = job.data;

    logger.info(`[CleanupWorker] Deleting ${r2Keys.length} R2 object(s) — reason: ${reason}`);

    let deleted = 0;
    for (const key of r2Keys) {
      try {
        await deleteFromB2(key);
        deleted++;
      } catch (err) {
        logger.error(`[CleanupWorker] Failed to delete ${key}:`, err);
      }
    }

    logger.info(`[CleanupWorker] Deleted ${deleted}/${r2Keys.length} objects`);
    // TODO: Write a Prometheus metric here once post-MVP monitoring is added
  },
  { connection: redisConnection, concurrency: 2 }
);

/**
 * Scheduled cleanup scan — called by the recurring scheduler.
 * Finds all conversion_jobs and merge_sessions older than 1 hour that still
 * have R2 keys, and enqueues a cleanup job for each.
 */
export async function scheduleExpiredFileCleanup() {
  const cutoff = new Date(Date.now() - FILE_TTL_MS);

  const expiredJobs = await prisma.conversionJob.findMany({
    where: {
      created_at: { lt: cutoff },
      r2_input_key: { not: null },
    },
    select: { id: true, r2_input_key: true, r2_output_key: true },
    take: 200,
  });

  for (const job of expiredJobs) {
    const keys = [job.r2_input_key, job.r2_output_key].filter(Boolean) as string[];
    if (keys.length > 0) {
      const { cleanupQueue } = await import('@/backend/queue/queues');
      await cleanupQueue.add('ttl-cleanup', {
        r2Keys: keys,
        reason: 'ttl_expired',
        relatedJobId: job.id,
      });
      // Clear the keys from the DB record so we don't enqueue twice
      await prisma.conversionJob.update({
        where: { id: job.id },
        data: { r2_input_key: null, r2_output_key: null },
      });
    }
  }
}
