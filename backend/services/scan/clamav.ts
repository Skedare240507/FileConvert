/**
 * services/scan/clamav.ts
 *
 * ClamAV malware scanning service.
 *
 * Every file passes through this before any worker runs.
 * Communicates with the ClamAV daemon container via TCP socket.
 *
 * Install: `npm install clamscan` (or use the raw TCP protocol if preferred).
 */

import net from 'net';
import { env } from '@/backend/config/env';
import { logger } from '@/backend/utils/logger';

export type ScanResult = 'clean' | 'infected' | 'error';

export interface ScanOutcome {
  result: ScanResult;
  /** Populated when result is 'infected', e.g. "Win.Test.EICAR_HDB-1" */
  virusName?: string;
}

/**
 * Scans a file Buffer against the ClamAV daemon via the INSTREAM command.
 * Returns { result: 'clean' } if the file is safe.
 * Returns { result: 'infected', virusName } if a virus is detected.
 * Returns { result: 'error' } if ClamAV is unreachable — in this case
 * the caller should reject the upload and alert via Sentry.
 */
export async function scanBuffer(buffer: Buffer): Promise<ScanOutcome> {
  return new Promise((resolve) => {
    const host = env.CLAMAV_HOST;
    const port = parseInt(env.CLAMAV_PORT, 10);

    const socket = net.createConnection({ host, port });
    const chunks: Buffer[] = [];

    socket.on('error', (err) => {
      logger.error('[ClamAV] Connection error:', err.message);
      resolve({ result: 'error' });
    });

    socket.on('connect', () => {
      // INSTREAM protocol: send the command, then 4-byte big-endian chunk sizes
      socket.write('zINSTREAM\0');

      const chunkSize = 8192;
      let offset = 0;

      while (offset < buffer.length) {
        const chunk = buffer.slice(offset, offset + chunkSize);
        const lengthBuf = Buffer.alloc(4);
        lengthBuf.writeUInt32BE(chunk.length, 0);
        socket.write(lengthBuf);
        socket.write(chunk);
        offset += chunkSize;
      }

      // Terminate with a 0-length chunk
      const end = Buffer.alloc(4);
      end.writeUInt32BE(0, 0);
      socket.write(end);
    });

    socket.on('data', (data) => chunks.push(data));

    socket.on('end', () => {
      const response = Buffer.concat(chunks).toString('utf-8').trim();
      logger.info('[ClamAV] Scan response:', response);

      if (response.includes('OK')) {
        resolve({ result: 'clean' });
      } else if (response.includes('FOUND')) {
        const match = response.match(/stream:\s+(.+)\s+FOUND/);
        resolve({ result: 'infected', virusName: match?.[1] ?? 'unknown' });
      } else {
        logger.warn('[ClamAV] Unexpected response:', response);
        resolve({ result: 'error' });
      }
    });
  });
}
