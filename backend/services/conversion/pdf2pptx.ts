/**
 * services/conversion/pdf2pptx.ts
 *
 * Converts PDF → PPTX by:
 *   1. Sending the PDF to Gotenberg's Chromium screenshot API to render each
 *      page as a JPEG image (returned as a ZIP for multi-page PDFs).
 *   2. Using pptxgenjs to build a valid PPTX with one full-slide image per page.
 *
 * This produces a real, openable PPTX — unlike the broken Gotenberg/LibreOffice
 * direct PDF→PPTX route which creates structurally invalid files.
 */

import JSZip from 'jszip';
import PptxGenJS from 'pptxgenjs';
import { logger } from '@/backend/utils/logger';
import { renderPdfToJpgPages } from '@/backend/workers/imageWorker';

/**
 * Render a PDF buffer to an array of JPEG buffers (one per page)
 * using ImageMagick (from imageWorker).
 */
async function pdfToJpegPages(pdfBuffer: Buffer): Promise<Buffer[]> {
  logger.info('[pdf2pptx] Sending PDF to ImageMagick for JPG rendering');
  const pages = await renderPdfToJpgPages(pdfBuffer, 150);
  return pages.map(p => p.data);
}

/**
 * Main entry point: converts a PDF Buffer to a PPTX Buffer.
 * Each PDF page becomes a full-slide image in the resulting presentation.
 */
export async function convertPdfToPptx(pdfBuffer: Buffer): Promise<Buffer> {
  const pages = await pdfToJpegPages(pdfBuffer);

  logger.info(`[pdf2pptx] Building PPTX with ${pages.length} slide(s)`);

  const pptx = new PptxGenJS();

  // Standard widescreen slide dimensions (16:9)
  pptx.layout = 'LAYOUT_16x9';

  for (let i = 0; i < pages.length; i++) {
    const slide = pptx.addSlide();
    const base64 = pages[i].toString('base64');

    slide.addImage({
      data: `image/jpeg;base64,${base64}`,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });

    logger.info(`[pdf2pptx] Added slide ${i + 1}/${pages.length}`);
  }

  // pptxgenjs.write() returns a base64 string when passed 'base64'
  const base64Output = await pptx.write({ outputType: 'base64' }) as string;
  return Buffer.from(base64Output, 'base64');
}
