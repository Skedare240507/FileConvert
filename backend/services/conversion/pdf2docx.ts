/**
 * services/conversion/pdf2docx.ts
 *
 * Calls the local Python pdf2docx microservice.
 * This is used specifically for PDF to DOCX because Gotenberg/LibreOffice
 * produces structurally broken Word files from PDFs.
 */

import { env } from '@/backend/config/env';
import { logger } from '@/backend/utils/logger';

const PDF_CONVERTER_BASE = env.PDF_CONVERTER_URL;

export async function convertPdfToDocx(inputBuffer: Buffer): Promise<Buffer> {
  const url = `${PDF_CONVERTER_BASE}/convert/pdf-to-docx`;

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(inputBuffer)], { type: 'application/pdf' }), 'input.pdf');

  logger.info(`[pdf2docx] Converting PDF -> DOCX via microservice`);

  const response = await fetch(url, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(120_000), // 2 min timeout
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`pdf2docx error ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
