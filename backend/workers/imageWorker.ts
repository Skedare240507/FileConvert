/**
 * workers/imageWorker.ts
 *
 * Processes image conversion jobs:
 *   PDF → JPG  (poppler / libvips, multi-page → ZIP)
 *   JPG → PDF  (pdf-lib, multi-image → multi-page PDF)
 *   JPG → PPT  (pptxgen, one slide per image)
 *
 * Primary engine: ImageMagick / libvips / pdf-lib / pptxgen
 */

import type { Job } from 'bullmq';
import { downloadFromR2, uploadToR2 } from '@/backend/services/storage/r2';
import { updateConversionJobStatus } from '@/backend/db/queries/conversionJobs';
import { JOB_STATUS } from '@/backend/config/constants';
import type { ConversionJobPayload } from '@/backend/queue/jobs/conversionJob';
import { logger } from '@/backend/utils/logger';

export async function processImageJob(job: Job<ConversionJobPayload>): Promise<void> {
  const { jobId, sourceType, targetType, r2InputKey, dpi } = job.data;
  const conversionKey = `${sourceType}:${targetType}`;

  logger.info(`[ImageWorker] Processing ${conversionKey} for job ${jobId}`);

  const inputBuffer = await downloadFromR2(r2InputKey);
  let outputBuffer: Buffer;
  let outputExt = targetType;

  switch (conversionKey) {
    case 'pdf:jpg': {
      // TODO: Implement PDF → JPG rasterisation via poppler/libvips
      // Multi-page output should be zipped
      outputExt = 'zip';
      throw new Error('PDF→JPG: implementation pending (Phase 4)');
    }
    case 'jpg:pdf': {
      // TODO: Implement JPG → PDF via pdf-lib
      throw new Error('JPG→PDF: implementation pending (Phase 4)');
    }
    case 'jpg:pptx': {
      // TODO: Implement JPG → PPT via pptxgen
      outputExt = 'pptx';
      throw new Error('JPG→PPT: implementation pending (Phase 4)');
    }
    default:
      throw new Error(`ImageWorker: unsupported conversion ${conversionKey}`);
  }

  const r2OutputKey = `output/${jobId}.${outputExt}`;
  await uploadToR2(r2OutputKey, outputBuffer!);

  await updateConversionJobStatus(jobId, JOB_STATUS.COMPLETED, {
    r2OutputKey,
    completedAt: new Date(),
  });

  logger.info(`[ImageWorker] Job ${jobId} completed — output: ${r2OutputKey}`);
}
