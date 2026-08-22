import { NextRequest } from 'next/server';
import { withAuth } from '@/backend/middleware/withAuth';
import { getConversionJobById } from '@/backend/db/queries/conversionJobs';
import { logger } from '@/backend/utils/logger';

export const GET = withAuth(async (req, ctx) => {
  try {
    // Extract jobId from URL path, as ctx in Route Handlers is not easily extended with params via middleware
    // We can parse the URL to get the segment.
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    const jobId = parts[parts.length - 1]; // /api/convert/jobs/[jobId]

    if (!jobId) {
      return Response.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const jobRecord = await getConversionJobById(jobId);
    
    if (!jobRecord) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    return Response.json({
      jobId: jobRecord.id,
      status: jobRecord.status,
      errorMessage: jobRecord.error_message,
      r2OutputKey: jobRecord.r2_output_key,
      clamScanResult: jobRecord.clam_scan_result,
      createdAt: jobRecord.created_at,
    });
  } catch (err) {
    logger.error('[API] /convert/jobs/[jobId] failed', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
});
