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
import { env } from '@/backend/config/env';

/**
 * Render a PDF buffer to an array of JPEG buffers (one per page)
 * using Gotenberg's Chromium screenshot endpoint.
 */
async function pdfToJpegPages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const gotenbergUrl = env.GOTENBERG_URL;

  const form = new FormData();
  form.append(
    'files',
    new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' }),
    'input.pdf'
  );
  // Ask LibreOffice to convert each PDF page to a PNG image
  form.append('outputFilename', 'output.png');

  logger.info('[pdf2pptx] Sending PDF to Gotenberg LibreOffice for PNG rendering');

  const res = await fetch(`${gotenbergUrl}/forms/libreoffice/convert`, {
    method: 'POST',
    body: form as unknown as BodyInit,
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gotenberg PDF→PNG conversion failed (${res.status}): ${errText}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  const responseBuffer = Buffer.from(await res.arrayBuffer());

  logger.info(`[pdf2pptx] Gotenberg response content-type: ${contentType}`);

  // Single-page PDF → Gotenberg returns a raw PNG
  if (!contentType.includes('zip') && !contentType.includes('octet-stream')) {
    logger.info('[pdf2pptx] Single page returned');
    return [responseBuffer];
  }

  // Multi-page PDF → Gotenberg returns a ZIP of PNGs
  logger.info('[pdf2pptx] Multi-page ZIP returned, extracting pages');
  const zip = await JSZip.loadAsync(responseBuffer);
  const fileNames = Object.keys(zip.files).sort(); // sort keeps page order
  const pages: Buffer[] = [];

  for (const name of fileNames) {
    if (zip.files[name].dir) continue;
    const data = await zip.files[name].async('nodebuffer');
    pages.push(data);
  }

  if (pages.length === 0) {
    throw new Error('[pdf2pptx] No pages extracted from Gotenberg ZIP');
  }

  return pages;
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
      data: `data:image/jpeg;base64,${base64}`,
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
