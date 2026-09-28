/**
 * services/conversion/pdf2docx.ts
 *
 * Calls the local Python pdf2docx microservice.
 * This is used specifically for PDF to DOCX because Gotenberg/LibreOffice
 * produces structurally broken Word files from PDFs.
 *
 * Options:
 *   imageDpi     — DPI for embedded images (default 150, lower = smaller output)
 *   imageQuality — JPEG quality 10–100 (default 80)
 */

import { env } from '@/backend/config/env';
import { logger } from '@/backend/utils/logger';

const PDF_CONVERTER_BASE = env.PDF_CONVERTER_URL;

export interface Pdf2DocxOptions {
  /** Resolution for embedded images, in DPI. Default 150. Lower values reduce file size. */
  imageDpi?: number;
  /** JPEG quality for embedded images, 10–100. Default 80. */
  imageQuality?: number;
}

export async function convertPdfToDocx(inputBuffer: Buffer, opts: Pdf2DocxOptions = {}): Promise<Buffer> {
  const { imageDpi = 150, imageQuality = 80 } = opts;

  const params = new URLSearchParams({
    image_dpi: String(imageDpi),
    image_quality: String(imageQuality),
  });

  const url = `${PDF_CONVERTER_BASE}/convert/pdf-to-docx?${params}`;

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(inputBuffer)], { type: 'application/pdf' }), 'input.pdf');

  logger.info(`[pdf2docx] Converting PDF -> DOCX via microservice (dpi=${imageDpi}, quality=${imageQuality})`);

  const response = await fetch(url, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(120_000), // 2 min timeout
  });

  if (!response.ok) {
    const text = await response.text();
    if (text.includes('No parsed pages') || text.includes('scanned')) {
      throw new Error(
        'This PDF appears to be a scanned document or contains no extractable text. ' +
        'Please use the OCR feature to convert it to a Word document.'
      );
    }
    throw new Error(`pdf2docx error ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
