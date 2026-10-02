/**
 * services/conversion/office2jpg.ts
 *
 * Office document to JPG conversion service.
 *
 * Pipeline:
 *   1. Gotenberg (LibreOffice) converts the Office file to an intermediate PDF.
 *   2. ImageMagick (via renderPdfToJpgZip) renders each PDF page as a JPEG.
 *
 * Workers (imageWorker.ts) call this and never import gotenberg.ts directly.
 */

import { convertWithGotenberg } from '@/backend/services/conversion/gotenberg';
import { renderPdfToJpgZip } from '@/backend/workers/imageWorker';
import { logger } from '@/backend/utils/logger';

/**
 * Converts an Office document buffer (DOCX, DOC, PPT, PPTX) to a ZIP of JPEG images.
 *
 * @param inputBuffer  - The source Office document as a Buffer
 * @param sourceType   - 'docx' | 'doc' | 'pptx' | 'ppt'
 * @param dpi          - Output resolution in DPI (default 150)
 * @returns A ZIP archive Buffer containing one JPEG per page/slide
 */
export async function convertOfficeToJpg(
  inputBuffer: Buffer,
  sourceType: string,
  dpi: number = 150,
): Promise<Buffer> {
  logger.info(`[office2jpg] Step 1: Converting ${sourceType} to PDF via Gotenberg (LibreOffice)`);
  const pdfBuffer = await convertWithGotenberg(inputBuffer, sourceType, 'pdf');

  logger.info(`[office2jpg] Step 2: Rendering PDF pages to JPG via ImageMagick (dpi=${dpi})`);
  const zipBuffer = await renderPdfToJpgZip(pdfBuffer, dpi);

  logger.info(`[office2jpg] Done — returning ZIP of JPEGs`);
  return zipBuffer;
}
