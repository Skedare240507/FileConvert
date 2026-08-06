/**
 * validation/merge.ts
 *
 * Zod schemas for merge session creation requests.
 */

import { z } from 'zod';

export const createMergeSessionSchema = z.object({
  fileType: z.enum(['pdf', 'word', 'ppt']),
  /** R2 keys of all input files, in desired merge order */
  r2InputKeys: z.array(z.string().min(1)).min(2).max(100),
});

export type CreateMergeSessionInput = z.infer<typeof createMergeSessionSchema>;
