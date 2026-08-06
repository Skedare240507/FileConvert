import { NextRequest } from 'next/server';
import { withAuth } from '@/backend/middleware/withAuth';
import { getConversionJobById } from '@/backend/db/queries/conversionJobs';
import { getSignedDownloadUrl } from '@/backend/services/storage/r2';
import { logger } from '@/backend/utils/logger';

export const GET = withAuth(async (req, ctx) => {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    // Path is /api/convert/jobs/[jobId]/download
    const jobId = parts[parts.length - 2]; 

    if (!jobId) {
      return Response.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const jobRecord = await getConversionJobById(jobId, ctx.userId);
    
    if (!jobRecord) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    if (jobRecord.status !== 'completed' || !jobRecord.r2_output_key) {
      return Response.json({ error: 'Job is not completed yet' }, { status: 400 });
    }

    // Generate short-lived download URL (5 minutes)
    const downloadUrl = await getSignedDownloadUrl(jobRecord.r2_output_key, 300);

    return Response.json({ downloadUrl });
  } catch (err) {
    logger.error('[API] /convert/jobs/[jobId]/download failed', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
