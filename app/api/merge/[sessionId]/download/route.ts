import { NextRequest } from 'next/server';
import { getMergeSessionById } from '@/backend/db/queries/mergeSessions';
import { getSignedDownloadUrl } from '@/backend/services/storage/storage';
import { logger } from '@/backend/utils/logger';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/');
    // Path is /api/merge/[sessionId]/download
    const sessionId = parts[parts.length - 2]; 

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const userId = 'anonymous'; // Currently all merges are anonymous
    const session = await getMergeSessionById(sessionId, userId);
    
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'completed' || !session.r2_output_key) {
      return Response.json({ error: 'Session is not completed yet' }, { status: 400 });
    }

    // Generate short-lived download URL (5 minutes)
    const downloadUrl = await getSignedDownloadUrl(session.r2_output_key, 300);

    return Response.json({ downloadUrl });
  } catch (err) {
    logger.error('[API] /merge/[sessionId]/download failed', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
