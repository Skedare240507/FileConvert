/**
 * queue/jobs/conversionJob.ts
 *
 * TypeScript payload shape for a conversion BullMQ job.
 */

import type { WorkerType, Engine } from '@/backend/config/constants';

export interface ConversionJobPayload {
  /** UUID of the conversion_jobs row */
  jobId: string;
  /** Authenticated user's id */
  userId: string;
  /** e.g. 'pdf', 'docx', 'jpg' */
  sourceType: string;
  /** e.g. 'docx', 'pdf', 'pptx' */
  targetType: string;
  /** Resolved worker type from CONVERSION_WORKER_MAP */
  workerType: WorkerType;
  /** Conversion engine to use */
  engineUsed: Engine;
  /** R2 object key for the uploaded input file */
  r2InputKey: string;
  /** Number of files in this session (for plan-limit enforcement) */
  fileCount: number;
  /** User's current plan at time of job creation */
  plan: 'free' | 'pro' | 'business';
  /** DPI setting for PDF→JPG conversions */
  dpi?: 150 | 300;
}
