/**
 * queue/jobs/cleanupJob.ts
 *
 * TypeScript payload shape for a scheduled R2 cleanup BullMQ job.
 */

export interface CleanupJobPayload {
  /** R2 object keys to delete */
  r2Keys: string[];
  /** Reason for deletion ('ttl_expired' | 'infected' | 'manual') */
  reason: 'ttl_expired' | 'infected' | 'manual';
  /** Optional: linked conversion job or merge session id for logging */
  relatedJobId?: string;
}
