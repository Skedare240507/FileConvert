/**
 * workers/ocrWorker.ts
 *
 * Processes OCR jobs:
 *   Scanned PDF → searchable text (pre-processing step before Document worker)
 *   Image → Text extraction (Phase 2 feature stub)
 *
 * Engine: Tesseract OCR
 */

import type { Job } from 'bullmq';
import { downloadFromR2, uploadToR2 } from '@/backend/services/storage/r2';
import { updateConversionJobStatus } from '@/backend/db/queries/conversionJobs';
import { JOB_STATUS } from '@/backend/config/constants';
import type { ConversionJobPayload } from '@/backend/queue/jobs/conversionJob';
import { logger } from '@/backend/utils/logger';

export async function processOcrJob(job: Job<ConversionJobPayload>): Promise<void> {
  const { jobId, r2InputKey, targetType } = job.data;

  logger.info(`[OcrWorker] Running Tesseract OCR for job ${jobId}`);

  const inputBuffer = await downloadFromR2(r2InputKey);

  // TODO: Call Tesseract via node-tesseract-ocr or spawn the CLI
  // For scanned PDFs → extract text, then pass to Document worker for final conversion
  // For image → text: output the extracted text as a .txt file
  throw new Error('OCR Worker: Tesseract integration pending (Phase 4, Days 48–49)');

  // After implementation:
  // const r2OutputKey = `output/${jobId}.${targetType}`;
  // await uploadToR2(r2OutputKey, outputBuffer);
  // await updateConversionJobStatus(jobId, JOB_STATUS.COMPLETED, { r2OutputKey, completedAt: new Date() });
}
