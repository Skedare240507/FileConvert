import { NextRequest } from 'next/server';
import { withAuth } from '@/backend/middleware/withAuth';
import { withRateLimit } from '@/backend/middleware/withRateLimit';
import { uploadInitSchema } from '@/backend/validation/upload';
import { buildR2UploadKey } from '@/backend/utils/sanitize';
import { getSignedUploadUrl } from '@/backend/services/storage/r2';
import { logger } from '@/backend/utils/logger';

export const POST = withRateLimit(
  withAuth(async (req, ctx) => {
    try {
      const body = await req.json();
      const parsed = uploadInitSchema.safeParse(body);
      
      if (!parsed.success) {
        return Response.json({ error: 'Invalid upload parameters', details: parsed.error.format() }, { status: 400 });
      }
      
      const data = parsed.data;
      
      // Limit file sizes dynamically based on plan if needed, but validation schema might handle it.
      const r2Key = buildR2UploadKey(ctx.userId, data.filename);
      // Generate a signed URL for direct upload to R2 (expires in 10 minutes)
      const uploadUrl = await getSignedUploadUrl(r2Key, 600);
      
      return Response.json({ r2Key, uploadUrl });
    } catch (err) {
      logger.error('[API] /convert/upload/init failed', err);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }),
  { limit: 20, windowSec: 60, prefix: 'rl:upload' }
);
