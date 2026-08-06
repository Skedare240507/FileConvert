/**
 * services/conversion/fallback.ts
 *
 * CloudConvert emergency fallback.
 *
 * Only used if Gotenberg is completely unreachable (e.g. container crash).
 * CloudConvert free tier: 25 conversions/day — treat as an emergency circuit
 * breaker, not a routine path.
 *
 * Install: npm install cloudconvert
 */

import CloudConvert from 'cloudconvert';
import { Readable } from 'stream';
import { env } from '@/backend/config/env';
import { logger } from '@/backend/utils/logger';

/**
 * Attempts a conversion via CloudConvert.
 * Throws if CLOUDCONVERT_API_KEY is not set — this keeps the fallback
 * completely optional and prevents accidental usage in development.
 */
export async function tryCloudConvertFallback(
  inputBuffer: Buffer,
  sourceType: string,
  targetType: string
): Promise<Buffer> {
  if (!env.CLOUDCONVERT_API_KEY) {
    throw new Error('CloudConvert fallback is not configured (CLOUDCONVERT_API_KEY missing)');
  }

  logger.warn(`[CloudConvert] Using emergency fallback: ${sourceType} → ${targetType}`);

  const cloudConvert = new CloudConvert(env.CLOUDCONVERT_API_KEY);

  try {
    const job = await cloudConvert.jobs.create({
      tasks: {
        'import-my-file': {
          operation: 'import/upload',
        },
        'convert-my-file': {
          operation: 'convert',
          input: 'import-my-file',
          input_format: sourceType,
          output_format: targetType,
        },
        'export-my-file': {
          operation: 'export/url',
          input: 'convert-my-file',
        },
      },
    });

    const uploadTask = job.tasks.find((task) => task.name === 'import-my-file');
    if (!uploadTask) throw new Error('Upload task not found');

    const stream = Readable.from(inputBuffer);
    
    // The SDK expects a ReadStream or similar readable with a known file name
    await cloudConvert.tasks.upload(uploadTask, stream as any, `input.${sourceType}`);

    const finishedJob = await cloudConvert.jobs.wait(job.id);
    const exportTask = finishedJob.tasks.find((task) => task.name === 'export-my-file');
    
    if (!exportTask || !exportTask.result || !exportTask.result.files) {
      throw new Error('Export task failed or returned no files');
    }

    const file = exportTask.result.files[0];
    if (!file || !file.url) {
      throw new Error('Export task did not return a valid file URL');
    }
    
    const response = await fetch(file.url);
    if (!response.ok) {
      throw new Error(`Failed to download from CloudConvert: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    logger.error('[CloudConvert] Fallback conversion failed:', err);
    throw err;
  }
}
