/**
 * services/conversion/pdf2pptx.ts
 *
 * Converts PDF → PPTX by:
 *   1. Rendering each PDF page as a JPEG via ImageMagick (renderPdfToJpgPages).
 *   2. Building a valid PPTX with pptxgenjs — one full-slide image per page.
 *
 * Why image slides instead of editable content?
 *   PDF text has no semantic structure that maps cleanly to PPT shapes without
 *   a full ML OCR/layout pipeline. Image slides are identical to what iLovePDF
 *   and Smallpdf produce for this conversion. For scanned PDFs there is no alternative.
 *
 * Slide sizing: we read the JPEG SOF marker to detect the first page's aspect ratio
 * and set the PPTX slide dimensions accordingly, so slides are never stretched.
 */

import PptxGenJS from 'pptxgenjs';
import { logger } from '@/backend/utils/logger';
import { renderPdfToJpgPages } from '@/backend/workers/imageWorker';

/**
 * Parse width & height from JPEG data without an external library.
 * Scans for SOF0/SOF1/SOF2 markers (0xFFC0–0xFFC2) which contain dimensions.
 */
function getJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  let offset = 0;
  // JPEG must start with FF D8
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  offset = 2;

  while (offset < buf.length - 1) {
    if (buf[offset] !== 0xff) break;
    const marker = buf[offset + 1];
    offset += 2;

    // SOF markers: C0 C1 C2 — contain image height & width
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      if (offset + 7 > buf.length) break;
      const height = (buf[offset + 3] << 8) | buf[offset + 4];
      const width  = (buf[offset + 5] << 8) | buf[offset + 6];
      return { width, height };
    }

    // Skip segment: next 2 bytes are segment length (including the length field itself)
    if (offset + 2 > buf.length) break;
    const segLen = (buf[offset] << 8) | buf[offset + 1];
    offset += segLen;
  }
  return null;
}

/**
 * Main entry point: converts a PDF Buffer to a PPTX Buffer.
 * Each PDF page becomes a full-slide image in the resulting presentation.
 */
export async function convertPdfToPptx(pdfBuffer: Buffer): Promise<Buffer> {
  logger.info('[pdf2pptx] Sending PDF to ImageMagick for JPG rendering');

  const pages = await renderPdfToJpgPages(pdfBuffer, 150);

  if (pages.length === 0) {
    throw new Error('PDF produced no renderable pages');
  }

  logger.info(`[pdf2pptx] Building PPTX with ${pages.length} slide(s)`);

  const pptx = new PptxGenJS();

  // Detect orientation from the first rendered page so slide dims match the PDF.
  // Falls back to 16:9 landscape if the JPEG header can't be read.
  let slideW = 10;   // inches — 16:9 landscape default
  let slideH = 7.5;

  const firstDim = getJpegDimensions(pages[0].data);
  if (firstDim && firstDim.height > firstDim.width) {
    // Portrait PDF (e.g. A4 letter/legal document)
    slideW = 7.5;
    slideH = 10;
    logger.info('[pdf2pptx] Detected portrait orientation — using 7.5×10 slide layout');
  } else {
    logger.info('[pdf2pptx] Using landscape 16:9 (10×7.5) slide layout');
  }

  pptx.defineLayout({ name: 'PDF_LAYOUT', width: slideW, height: slideH });
  pptx.layout = 'PDF_LAYOUT';

  for (let i = 0; i < pages.length; i++) {
    const slide = pptx.addSlide();
    const base64 = pages[i].data.toString('base64');

    slide.addImage({
      data: `image/jpeg;base64,${base64}`,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });

    logger.info(`[pdf2pptx] Added slide ${i + 1}/${pages.length}`);
  }

  const base64Output = await pptx.write({ outputType: 'base64' }) as string;
  return Buffer.from(base64Output, 'base64');
}
