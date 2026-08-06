/**
 * queue/queues.ts
 *
 * BullMQ Queue instances — one per job type.
 * API routes add jobs to these queues; worker files consume them.
 */

import { Queue } from 'bullmq';
import { redisConnection } from './client';
import { QUEUE_NAMES, JOB_MAX_RETRIES, JOB_BACKOFF_DELAYS } from '@/backend/config/constants';

const defaultJobOptions = {
  attempts: JOB_MAX_RETRIES,
  backoff: {
    type: 'custom' as const,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: false, // keep failed jobs visible in the dead-letter queue
};

/** Conversion job queue — consumed by the Orchestrator, then routed to workers */
export const conversionQueue = new Queue(QUEUE_NAMES.CONVERSION, {
  connection: redisConnection,
  defaultJobOptions,
});

/** Merge session queue — consumed by the Document worker */
export const mergeQueue = new Queue(QUEUE_NAMES.MERGE, {
  connection: redisConnection,
  defaultJobOptions,
});

/** ClamAV scan queue — runs before any conversion or merge job */
export const scanQueue = new Queue(QUEUE_NAMES.SCAN, {
  connection: redisConnection,
  defaultJobOptions: { attempts: 1, removeOnComplete: true, removeOnFail: false },
});

/** Scheduled R2 cleanup job — triggered every minute by the cleanup worker */
export const cleanupQueue = new Queue(QUEUE_NAMES.CLEANUP, {
  connection: redisConnection,
  defaultJobOptions: { attempts: 1, removeOnComplete: true, removeOnFail: false },
});

/** Helper: get queue length metrics for the admin dashboard */
export async function getQueueMetrics() {
  const [convCounts, mergeCounts, scanCounts] = await Promise.all([
    conversionQueue.getJobCounts('waiting', 'active', 'failed', 'completed', 'delayed'),
    mergeQueue.getJobCounts('waiting', 'active', 'failed', 'completed', 'delayed'),
    scanQueue.getJobCounts('waiting', 'active', 'failed'),
  ]);

  return {
    conversion: convCounts,
    merge: mergeCounts,
    scan: scanCounts,
  };
}

// Expose per-queue backoff for the Orchestrator's custom backoff strategy
export { JOB_BACKOFF_DELAYS };
