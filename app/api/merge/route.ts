import { NextRequest } from 'next/server';
import { buildR2UploadKey } from '@/backend/utils/sanitize';
import { uploadToB2 } from '@/backend/services/storage/storage';
import { scanBuffer } from '@/backend/services/scan/clamav';
import { createMergeSession } from '@/backend/db/queries/mergeSessions';
import { mergeQueue } from '@/backend/queue/queues';
import { logger } from '@/backend/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    const fileType = formData.get('fileType') as 'pdf' | 'word' | 'ppt' | null;
    
    if (!files || files.length < 2) {
      return Response.json({ error: 'At least two files are required for merging' }, { status: 400 });
    }

    if (!fileType) {
      return Response.json({ error: 'fileType is required' }, { status: 400 });
    }

    const userId = null; // Using null for unauthenticated

    // Create session in DB
    const session = await createMergeSession({
      userId,
      fileType,
      fileCount: files.length,
    });

    const r2InputKeys: string[] = [];

    // Upload files sequentially to maintain order
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const r2Key = buildR2UploadKey('anonymous', `${session.id}_${i}_${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const scanResult = await scanBuffer(buffer);
      if (scanResult.result === 'infected') {
        logger.warn(`[API] /merge rejected malware in file ${file.name}: ${scanResult.virusName}`);
        return Response.json({ error: `Malware detected in file ${file.name}`, details: scanResult.virusName }, { status: 400 });
      }
      if (scanResult.result === 'error') {
        logger.error(`[API] /merge ClamAV unavailable — rejecting upload for safety`);
        return Response.json({ error: 'File scanning service unavailable, please try again' }, { status: 503 });
      }

      await uploadToB2(r2Key, buffer, file.type || 'application/octet-stream');
      r2InputKeys.push(r2Key);
    }

    // Add to merge queue
    await mergeQueue.add('mergeJob', {
      sessionId: session.id,
      userId,
      fileType,
      r2InputKeys,
      plan: 'free',
    });

    logger.info(`[API] Enqueued merge session ${session.id}`);

    return Response.json({ sessionId: session.id });
  } catch (err) {
    logger.error('[API] /merge failed', err);
    return Response.json({ error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
