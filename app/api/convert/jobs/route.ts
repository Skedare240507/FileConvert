import { NextRequest } from 'next/server';
import { withRateLimit } from '@/backend/middleware/withRateLimit';
import { createConversionJobSchema } from '@/backend/validation/conversion';
import { createConversionJob } from '@/backend/db/queries/conversionJobs';
import { conversionQueue } from '@/backend/queue/queues';
import { CONVERSION_WORKER_MAP, WORKER_TYPES, ENGINES, type Engine } from '@/backend/config/constants';
import { logger } from '@/backend/utils/logger';

function getDefaultEngine(workerType: string, sourceType: string, targetType: string): Engine {
  if (workerType === WORKER_TYPES.DOCUMENT) {
    if (sourceType === 'xlsx' || sourceType === 'csv') return ENGINES.SHEETJS;
    return ENGINES.GOTENBERG;
  }
  if (workerType === WORKER_TYPES.IMAGE) {
    if (targetType === 'pdf') return ENGINES.PDF_LIB;
    if (targetType === 'pptx') return ENGINES.PPTX_GEN;
    return ENGINES.IMAGEMAGICK;
  }
  if (workerType === WORKER_TYPES.OCR) {
    return ENGINES.TESSERACT;
  }
  return ENGINES.GOTENBERG; // fallback
}

export const POST = withRateLimit(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const parsed = createConversionJobSchema.safeParse(body);
      
      if (!parsed.success) {
        return Response.json({ error: 'Invalid job parameters', details: parsed.error.format() }, { status: 400 });
      }
      
      const data = parsed.data;
      
      const workerType = CONVERSION_WORKER_MAP[`${data.sourceType}:${data.targetType}`];
      if (!workerType) {
        return Response.json({ error: 'Unsupported conversion type' }, { status: 400 });
      }

      const engineUsed = getDefaultEngine(workerType, data.sourceType, data.targetType);
      
      const jobRecord = await createConversionJob({
        userId: null,
        sourceType: data.sourceType,
        targetType: data.targetType,
        workerType,
        engineUsed,
        fileCount: data.fileCount ?? 1,
        r2InputKey: data.r2InputKey,
      });
      
      // Enqueue job to BullMQ
      await conversionQueue.add(jobRecord.id, {
        jobId: jobRecord.id,
        sourceType: data.sourceType,
        targetType: data.targetType,
        r2InputKey: data.r2InputKey,
        workerType,
        engineUsed,
        dpi: data.dpi ? parseInt(data.dpi, 10) as 150 | 300 : undefined,
      });
      
      logger.info(`[API] Created conversion job ${jobRecord.id} for anonymous user`);
      return Response.json({ jobId: jobRecord.id, status: jobRecord.status });
    } catch (err) {
      logger.error('[API] /convert/jobs failed', err);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  { limit: 10, windowSec: 60, prefix: 'rl:jobs' }
);
