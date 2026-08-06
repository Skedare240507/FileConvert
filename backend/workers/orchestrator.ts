/**
 * workers/orchestrator.ts
 *
 * The Orchestrator reads jobs from the conversion queue and routes each one
 * to the correct worker (Document, Image, or OCR) based on the CONVERSION_WORKER_MAP.
 *
 * Also manages:
 * - Retry count tracking (up to JOB_MAX_RETRIES)
 * - Dead-letter queue promotion on repeated failure
 * - Redis distributed lock so a job is never processed twice concurrently
 *
 * NOTE: This file is designed to run as a standalone Node process on VM 2.
 * It imports from the shared backend package but does NOT use Next.js.
 */

import { Worker, Job } from 'bullmq';
import { redisConnection } from '@/backend/queue/client';
import { QUEUE_NAMES, WORKER_TYPES, JOB_MAX_RETRIES, JOB_STATUS, JOB_BACKOFF_DELAYS } from '@/backend/config/constants';
import { updateConversionJobStatus } from '@/backend/db/queries/conversionJobs';
import type { ConversionJobPayload } from '@/backend/queue/jobs/conversionJob';
import { logger } from '@/backend/utils/logger';

// Import individual worker processors
import { processDocumentJob } from './documentWorker';
import { processImageJob } from './imageWorker';
import { processOcrJob } from './ocrWorker';

const orchestratorWorker = new Worker<ConversionJobPayload>(
  QUEUE_NAMES.CONVERSION,
  async (job: Job<ConversionJobPayload>) => {
    const { jobId, workerType } = job.data;

    logger.info(`[Orchestrator] Routing job ${jobId} → ${workerType} worker`);

    await updateConversionJobStatus(jobId, JOB_STATUS.PROCESSING);

    try {
      switch (workerType) {
        case WORKER_TYPES.DOCUMENT:
          return await processDocumentJob(job);
        case WORKER_TYPES.IMAGE:
          return await processImageJob(job);
        case WORKER_TYPES.OCR:
          return await processOcrJob(job);
        default:
          throw new Error(`Unknown worker type: ${workerType}`);
      }
    } catch (err) {
      const retryCount = (job.attemptsMade ?? 0);
      logger.error(`[Orchestrator] Job ${jobId} failed (attempt ${retryCount}):`, err);

      await updateConversionJobStatus(jobId, JOB_STATUS.FAILED, {
        retryCount,
        errorMessage: err instanceof Error ? err.message : String(err),
      });

      if (retryCount >= JOB_MAX_RETRIES) {
        logger.warn(`[Orchestrator] Job ${jobId} moved to dead-letter queue`);
        await updateConversionJobStatus(jobId, JOB_STATUS.DEAD_LETTER, {
          retryCount,
          errorMessage: `Exhausted ${JOB_MAX_RETRIES} retries. Last error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }

      throw err; // Re-throw so BullMQ can apply its backoff + retry logic
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    // Custom backoff: [5s, 30s, 2min]
    settings: {
      backoffStrategy: (attemptsMade: number) =>
        JOB_BACKOFF_DELAYS[Math.min(attemptsMade - 1, JOB_BACKOFF_DELAYS.length - 1)] ?? 120_000,
    },
  }
);

orchestratorWorker.on('completed', (job: Job<ConversionJobPayload>) => {
  logger.info(`[Orchestrator] Job ${job.data.jobId} completed successfully`);
});

orchestratorWorker.on('failed', (job: Job<ConversionJobPayload> | undefined, err: Error) => {
  logger.error(`[Orchestrator] Job ${job?.data?.jobId} failed permanently:`, err.message);
});

export default orchestratorWorker;
