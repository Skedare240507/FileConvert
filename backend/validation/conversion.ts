/**
 * validation/conversion.ts
 *
 * Zod schemas for conversion job creation requests.
 */

import { z } from 'zod';
import { CONVERSION_WORKER_MAP } from '@/backend/config/constants';

export const createConversionJobSchema = z.object({
  r2InputKey: z.string().min(1),
  sourceType: z.string().min(1).max(10),
  targetType: z.string().min(1).max(10),
  fileCount: z.number().int().positive().default(1),
  dpi: z.enum(['150', '300']).optional(),
}).refine(
  (data) => {
    const key = `${data.sourceType}:${data.targetType}`;
    return key in CONVERSION_WORKER_MAP;
  },
  { message: 'Unsupported conversion type' }
);

export type CreateConversionJobInput = z.infer<typeof createConversionJobSchema>;
