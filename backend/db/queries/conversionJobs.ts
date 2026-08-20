/**
 * db/queries/conversionJobs.ts
 *
 * Typed query helpers for the `conversion_jobs` table.
 */

import { prisma } from '../client';
import type { JobStatus, WorkerType, Engine } from '@/backend/config/constants';

export interface CreateConversionJobInput {
  userId?: string | null;
  sourceType: string;
  targetType: string;
  workerType: WorkerType;
  engineUsed: Engine;
  fileCount?: number;
  r2InputKey?: string;
}

export async function createConversionJob(data: CreateConversionJobInput) {
  return prisma.conversionJob.create({
    data: {
      user_id: data.userId ?? undefined,
      source_type: data.sourceType,
      target_type: data.targetType,
      status: 'queued',
      worker_type: data.workerType,
      engine_used: data.engineUsed,
      file_count: data.fileCount ?? 1,
      r2_input_key: data.r2InputKey,
    },
  });
}

export async function getConversionJobById(jobId: string) {
  return prisma.conversionJob.findFirst({
    where: { id: jobId },
  });
}

export async function updateConversionJobStatus(
  jobId: string,
  status: JobStatus,
  extras?: {
    r2OutputKey?: string;
    errorMessage?: string;
    clamScanResult?: string;
    completedAt?: Date;
    retryCount?: number;
  }
) {
  return prisma.conversionJob.update({
    where: { id: jobId },
    data: {
      status,
      ...(extras?.r2OutputKey && { r2_output_key: extras.r2OutputKey }),
      ...(extras?.errorMessage && { error_message: extras.errorMessage }),
      ...(extras?.clamScanResult && { clam_scan_result: extras.clamScanResult }),
      ...(extras?.completedAt && { completed_at: extras.completedAt }),
      ...(extras?.retryCount !== undefined && { retry_count: extras.retryCount }),
    },
  });
}

export async function getDeadLetterJobs() {
  return prisma.conversionJob.findMany({
    where: { status: 'dead_letter' },
    orderBy: { created_at: 'desc' },
    take: 100,
  });
}

export async function getUserJobHistory(userId: string, limit = 20) {
  return prisma.conversionJob.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
}
