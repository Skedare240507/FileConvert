/**
 * workers/mergeWorker.ts
 *
 * Processes merge jobs from the MERGE queue.
 * Merges multiple files (PDF, Word, or PPT) into a single PDF using Gotenberg.
 */

import type { Job } from 'bullmq';
import { mergeWithGotenberg } from '@/backend/services/conversion/gotenberg';
import { downloadFromB2, uploadToB2 } from '@/backend/services/storage/storage';
import { updateMergeSessionStatus } from '@/backend/db/queries/mergeSessions';
import { JOB_STATUS } from '@/backend/config/constants';
import type { MergeJobPayload } from '@/backend/queue/jobs/mergeJob';
import { logger } from '@/backend/utils/logger';

export async function processMergeJob(job: Job<MergeJobPayload>): Promise<void> {
  const { sessionId, sourceType, r2InputKeys } = job.data as any; // sourceType was not in interface? Wait, let me check the interface
  // Wait, interface has `fileType` not `sourceType`
  const fileType = job.data.fileType;

  logger.info(`[MergeWorker] Processing merge for session ${sessionId} (${fileType}, ${r2InputKeys.length} files)`);

  // 1. Download all input files sequentially (or in parallel)
  const inputBuffers: Buffer[] = [];
  for (const key of r2InputKeys) {
    const buffer = await downloadFromB2(key);
    inputBuffers.push(buffer);
  }

  // 2. Perform merge
  const outputBuffer = await mergeWithGotenberg(inputBuffers, fileType);

  // 3. Upload the merged output to B2
  const r2OutputKey = `output/merge_${sessionId}.pdf`;
  await uploadToB2(r2OutputKey, outputBuffer);

  // 4. Mark job completed
  await updateMergeSessionStatus(sessionId, JOB_STATUS.COMPLETED, r2OutputKey);

  logger.info(`[MergeWorker] Session ${sessionId} completed — output: ${r2OutputKey}`);
}
