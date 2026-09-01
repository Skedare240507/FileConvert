import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getConversionJobById } from '@/backend/db/queries/conversionJobs';
import { logger } from '@/backend/utils/logger';

export async function GET(req: NextRequest) {
  try {
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

    // Verify ownership if the job belongs to a specific user
    if (jobRecord.user_id) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.id !== jobRecord.user_id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
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
}
