import { NextRequest } from 'next/server';
import { getMergeSessionById } from '@/backend/db/queries/mergeSessions';
import { getSignedDownloadUrl } from '@/backend/services/storage/storage';
import { resolveTenantIdentity, canAccessResource } from '@/backend/utils/tenantSecurity';
import { logger } from '@/backend/utils/logger';
import { withRateLimit } from '@/backend/middleware/withRateLimit';

export const GET = withRateLimit(
  async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      // Path is /api/merge/[sessionId]/download
      const sessionId = parts[parts.length - 2]; 

      if (!sessionId) {
        return Response.json({ error: 'Missing sessionId' }, { status: 400 });
      }

      const sessionRecord = await getMergeSessionById(sessionId);
      
      if (!sessionRecord) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }

      // Verify ownership (authenticated user or anonymous guest cookie)
      const tenant = await resolveTenantIdentity(req);
      if (!canAccessResource(sessionRecord, tenant)) {
        logger.warn(`[API] Download unauthorized access attempt on merge session ${sessionId}`);
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (sessionRecord.status !== 'completed' || !sessionRecord.r2_output_key) {
        return Response.json({ error: 'Session is not completed yet' }, { status: 400 });
      }

      // Generate short-lived download URL (5 minutes)
      const downloadUrl = await getSignedDownloadUrl(sessionRecord.r2_output_key, 300);

      return Response.json({ downloadUrl });
    } catch (err) {
      logger.error('[API] /merge/[sessionId]/download failed', err);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  { limit: 20, windowSec: 60, prefix: 'rl:download' }
);
