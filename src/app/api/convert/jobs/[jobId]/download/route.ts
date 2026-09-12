import { NextRequest } from 'next/server';
import { getConversionJobById } from '@/backend/db/queries/conversionJobs';
import { getSignedDownloadUrl } from '@/backend/services/storage/storage';
import { resolveTenantIdentity, canAccessResource } from '@/backend/utils/tenantSecurity';
import { logger } from '@/backend/utils/logger';
import { withRateLimit } from '@/backend/middleware/withRateLimit';

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      const jobId = parts[parts.length - 2]; // /api/convert/jobs/[jobId]/download

      if (!jobId) {
        return Response.json({ error: 'Missing jobId' }, { status: 400 });
      }

      const jobRecord = await getConversionJobById(jobId);
      
      if (!jobRecord) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }

      // Verify ownership (authenticated user or anonymous guest cookie)
      const tenant = await resolveTenantIdentity(req);
      if (!canAccessResource(jobRecord, tenant)) {
        logger.warn(`[API] Download unauthorized access attempt on job ${jobId}`);
        return Response.json({ error: 'Forbidden' }, { status: 403 });
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
  },
  { limit: 20, windowSec: 60, prefix: 'rl:download' }
);

