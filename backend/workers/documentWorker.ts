/**
 * workers/documentWorker.ts
 *
 * Processes document conversion jobs:
 *   PDF ↔ Word (.docx), PDF → PPT, Word → PPT
 *   Excel ↔ CSV (via SheetJS, in-process)
 *   File Merge: PDF, Word, PPT
 *
 * Primary engine: Gotenberg (LibreOffice)
 * Fallback: CloudConvert (emergency only — when Gotenberg is down)
 */

import type { Job } from 'bullmq';
import { convertWithGotenberg } from '@/backend/services/conversion/gotenberg';
import { convertExcelCsv } from '@/backend/services/conversion/sheetjs';
import { tryCloudConvertFallback } from '@/backend/services/conversion/fallback';
import { downloadFromR2, uploadToR2 } from '@/backend/services/storage/storage';
import { updateConversionJobStatus } from '@/backend/db/queries/conversionJobs';
import { JOB_STATUS } from '@/backend/config/constants';
import type { ConversionJobPayload } from '@/backend/queue/jobs/conversionJob';
import { logger } from '@/backend/utils/logger';

const SHEETJS_TYPES = new Set(['xlsx:csv', 'csv:xlsx']);

export async function processDocumentJob(job: Job<ConversionJobPayload>): Promise<void> {
  const { jobId, sourceType, targetType, r2InputKey, engineUsed } = job.data;
  const conversionKey = `${sourceType}:${targetType}`;

  logger.info(`[DocumentWorker] Processing ${conversionKey} for job ${jobId}`);

  // 1. Download the input file from R2
  const inputBuffer = await downloadFromR2(r2InputKey);

  let outputBuffer: Buffer;

  // 2. Route to correct engine
  if (SHEETJS_TYPES.has(conversionKey)) {
    outputBuffer = await convertExcelCsv(inputBuffer, sourceType, targetType);
  } else {
    try {
      outputBuffer = await convertWithGotenberg(inputBuffer, sourceType, targetType);
    } catch (gotenbergErr) {
      logger.warn(`[DocumentWorker] Gotenberg failed, trying CloudConvert fallback:`, gotenbergErr);
      outputBuffer = await tryCloudConvertFallback(inputBuffer, sourceType, targetType);
    }
  }

  // 3. Upload the output to R2
  const r2OutputKey = `output/${jobId}.${targetType}`;
  await uploadToR2(r2OutputKey, outputBuffer);

  // 4. Mark job completed
  await updateConversionJobStatus(jobId, JOB_STATUS.COMPLETED, {
    r2OutputKey,
    completedAt: new Date(),
  });

  logger.info(`[DocumentWorker] Job ${jobId} completed — output: ${r2OutputKey}`);
}
