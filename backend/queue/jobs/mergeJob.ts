/**
 * queue/jobs/mergeJob.ts
 *
 * TypeScript payload shape for a merge BullMQ job.
 */

export interface MergeJobPayload {
  /** UUID of the merge_sessions row */
  sessionId: string;
  userId: string;
  fileType: 'pdf' | 'word' | 'ppt';
  /** R2 object keys for all input files, in merge order */
  r2InputKeys: string[];
  plan: 'free' | 'pro' | 'business';
}
