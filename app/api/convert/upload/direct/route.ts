import { NextRequest } from 'next/server';
import { buildR2UploadKey } from '@/backend/utils/sanitize';
import { uploadToB2 } from '@/backend/services/storage/storage';
import { scanBuffer } from '@/backend/services/scan/clamav';
import { logger } from '@/backend/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Using "anonymous" for unauthenticated uploads
    const r2Key = buildR2UploadKey('anonymous', file.name);
    
    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const scanResult = await scanBuffer(buffer);
    if (!scanResult.isClean) {
      logger.warn(`[API] /convert/upload/direct rejected malware: ${scanResult.viruses.join(', ')}`);
      return Response.json({ error: 'Malware detected', details: scanResult.viruses }, { status: 400 });
    }
    
    await uploadToB2(r2Key, buffer, file.type || 'application/octet-stream');
    
    return Response.json({ r2Key });
  } catch (err) {
    logger.error('[API] /convert/upload/direct failed', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
