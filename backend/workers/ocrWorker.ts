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
import { downloadFromB2, uploadToB2 } from '@/backend/services/storage/storage';
import { updateConversionJobStatus } from '@/backend/db/queries/conversionJobs';
import { JOB_STATUS } from '@/backend/config/constants';
import type { ConversionJobPayload } from '@/backend/queue/jobs/conversionJob';
import { logger } from '@/backend/utils/logger';

import { createWorker } from 'tesseract.js';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import crypto from 'crypto';

const execFileAsync = promisify(execFile);

export async function processOcrJob(job: Job<ConversionJobPayload>): Promise<void> {
  const { jobId, r2InputKey, targetType, sourceType } = job.data;
  logger.info(`[OcrWorker] Running Tesseract OCR for job ${jobId}`);

  const inputBuffer = await downloadFromB2(r2InputKey);
  let extractedText = '';

  const tmpId = crypto.randomUUID();
  const tmpInputPath = path.join(os.tmpdir(), `${tmpId}.${sourceType}`);

  await fs.writeFile(tmpInputPath, inputBuffer);

  try {
    const imagesToOcr: string[] = [];

    if (sourceType === 'pdf') {
      const tmpImgPrefix = path.join(os.tmpdir(), `${tmpId}_page_`);
      await execFileAsync('magick', ['-density', '300', tmpInputPath, `${tmpImgPrefix}%03d.png`]);
      
      const files = await fs.readdir(os.tmpdir());
      const generatedImgs = files.filter(f => f.startsWith(`${tmpId}_page_`) && f.endsWith('.png'));
      generatedImgs.sort(); // ensure page order
      
      for (const file of generatedImgs) {
        imagesToOcr.push(path.join(os.tmpdir(), file));
      }
    } else {
      imagesToOcr.push(tmpInputPath);
    }

    const worker = await createWorker('eng');
    
    for (const imgPath of imagesToOcr) {
      const { data: { text } } = await worker.recognize(imgPath);
      extractedText += text + '\n\n';
    }
    
    await worker.terminate();

    if (sourceType === 'pdf') {
      for (const imgPath of imagesToOcr) {
        await fs.unlink(imgPath).catch(() => {});
      }
    }
  } finally {
    await fs.unlink(tmpInputPath).catch(() => {});
  }

  const outputBuffer = Buffer.from(extractedText, 'utf-8');
  const r2OutputKey = `output/${jobId}.txt`;
  
  await uploadToB2(r2OutputKey, outputBuffer);
  await updateConversionJobStatus(jobId, JOB_STATUS.COMPLETED, { r2OutputKey, completedAt: new Date() });
  
  logger.info(`[OcrWorker] Job ${jobId} completed — text extracted`);
}
