import { NextRequest } from 'next/server';
import { buildR2UploadKey } from '@/backend/utils/sanitize';
import { uploadToB2 } from '@/backend/services/storage/storage';
import { scanBuffer } from '@/backend/services/scan/clamav';
import { verifyMagicBytes } from '@/backend/validation/upload';
import { resolveTenantIdentity } from '@/backend/utils/tenantSecurity';
import { logger } from '@/backend/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Cyber defense: Deep magic bytes inspection against disguised executables/payloads
    if (ext && !verifyMagicBytes(buffer, ext)) {
      logger.warn(`[API] /convert/upload/direct rejected spoofed file: ${file.name}`);
      return Response.json({ error: 'File content does not match the declared extension' }, { status: 400 });
    }

    // 2. Anti-Malware scanning via ClamAV
    const scanResult = await scanBuffer(buffer);
    if (scanResult.result === 'infected') {
      logger.warn(`[API] /convert/upload/direct rejected malware: ${scanResult.virusName}`);
      return Response.json({ error: 'Malware detected', details: scanResult.virusName }, { status: 400 });
    }
    if (scanResult.result === 'error') {
      logger.error('[API] /convert/upload/direct ClamAV unavailable — rejecting upload for safety');
      return Response.json({ error: 'File scanning service unavailable, please try again' }, { status: 503 });
    }

    const tenant = await resolveTenantIdentity(req);
    const ownerFolder = tenant.userId ?? 'anonymous';
    const r2Key = buildR2UploadKey(ownerFolder, file.name);
    
    await uploadToB2(r2Key, buffer, file.type || 'application/octet-stream');
    
    return Response.json({ r2Key });
  } catch (err) {
    logger.error('[API] /convert/upload/direct failed', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
