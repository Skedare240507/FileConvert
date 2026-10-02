/**
 * workers/imageWorker.ts
 *
 * Processes image conversion jobs:
 *   PDF → JPG  (ImageMagick, multi-page → ZIP)
 *   JPG → PDF  (pdf-lib, single image → single-page PDF)
 *   JPG → PPTX (pptxgenjs, single image → single-slide PPTX)
 *   ZIP → PDF  (pdf-lib, multi-image batch → multi-page PDF, one page per image)
 *   ZIP → PPTX (pptxgenjs, multi-image batch → PPTX, one slide per image, in order)
 */

import type { Job } from 'bullmq';
import crypto from 'crypto';
import { downloadFromB2, uploadToB2 } from '@/backend/services/storage/storage';
import { updateConversionJobStatus } from '@/backend/db/queries/conversionJobs';
import { JOB_STATUS } from '@/backend/config/constants';
import type { ConversionJobPayload } from '@/backend/queue/jobs/conversionJob';
import { logger } from '@/backend/utils/logger';

import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import { promises as fs } from 'fs';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

const execFileAsync = promisify(execFile);

// Resolve the ImageMagick binary.
// - Inside Docker (Debian apt): ImageMagick 6 installs as 'convert'
// - Windows with IM7 portable:  magick.exe at %USERPROFILE%\ImageMagick\
function getMagickBin(): string {
  const winPath = `${process.env.USERPROFILE ?? ''}\\ImageMagick\\magick.exe`;
  try {
    if (process.platform === 'win32' && require('fs').existsSync(winPath)) {
      return winPath;
    }
  } catch { /* ignore */ }
  return process.platform === 'win32' ? 'magick' : 'convert';
}

export async function renderPdfToJpgPages(pdfBuffer: Buffer, dpiVal: number = 150): Promise<{ name: string, data: Buffer }[]> {
  const tmpId = crypto.randomUUID();
  const tmpPdfPath = path.join(os.tmpdir(), `${tmpId}.pdf`);
  const tmpJpgPrefix = path.join(os.tmpdir(), `${tmpId}_page_`);

  await fs.writeFile(tmpPdfPath, pdfBuffer);

  try {
    await execFileAsync(getMagickBin(), ['-density', String(dpiVal), tmpPdfPath, `${tmpJpgPrefix}%03d.jpg`]);

    const files = await fs.readdir(os.tmpdir());
    const generatedJpgs = files
      .filter(f => f.startsWith(`${tmpId}_page_`) && f.endsWith('.jpg'))
      .sort();

    if (generatedJpgs.length === 0) throw new Error('ImageMagick generated no files');

    const pages = [];
    for (const file of generatedJpgs) {
      const filePath = path.join(os.tmpdir(), file);
      const data = await fs.readFile(filePath);
      pages.push({ name: file, data });
      await fs.unlink(filePath).catch(() => {});
    }
    return pages;
  } finally {
    await fs.unlink(tmpPdfPath).catch(() => {});
  }
}

export async function renderPdfToJpgZip(pdfBuffer: Buffer, dpiVal: number = 150): Promise<Buffer> {
  const pages = await renderPdfToJpgPages(pdfBuffer, dpiVal);
  const zip = new JSZip();
  for (const page of pages) zip.file(page.name, page.data);
  return await zip.generateAsync({ type: 'nodebuffer' });
}

/** Detect image type from magic bytes. Returns 'png', 'jpg', or null. */
function detectImageType(buf: Buffer): 'png' | 'jpg' | null {
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  return null;
}

/**
 * Extract image buffers from a ZIP archive in sorted filename order.
 * Filenames are sorted alphabetically so the zero-padded client-side order is preserved.
 * Only jpg/jpeg/png/webp files are included; directories and other files are skipped.
 */
async function extractImagesFromZip(zipBuffer: Buffer): Promise<Buffer[]> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

  const entries = Object.entries(zip.files)
    .filter(([name, file]) => !file.dir && imageExts.has(path.extname(name).toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b)); // preserves the zero-padded insertion order

  if (entries.length === 0) throw new Error('ZIP contains no supported image files (jpg/png/webp)');

  const buffers: Buffer[] = [];
  for (const [, file] of entries) {
    buffers.push(await file.async('nodebuffer'));
  }
  return buffers;
}

export async function processImageJob(job: Job<ConversionJobPayload>): Promise<void> {
  const { jobId, sourceType, targetType, r2InputKey, dpi } = job.data;
  const conversionKey = `${sourceType}:${targetType}`;

  logger.info(`[ImageWorker] Processing ${conversionKey} for job ${jobId}`);

  const inputBuffer = await downloadFromB2(r2InputKey);
  let outputBuffer: Buffer;
  let outputExt = targetType;

  switch (conversionKey) {
    // ── PDF → JPG (one ZIP of JPEGs, one per page) ────────────────────────
    case 'pdf:jpg': {
      outputExt = 'zip';
      outputBuffer = await renderPdfToJpgZip(inputBuffer, dpi || 150);
      break;
    }

    // ── Office → JPG (dedicated office2jpg service handles PPT/PPTX/DOC/DOCX) ─
    case 'docx:jpg':
    case 'doc:jpg':
    case 'ppt:jpg':
    case 'pptx:jpg': {
      outputExt = 'zip';
      const { convertOfficeToJpg } = await import('@/backend/services/conversion/office2jpg');
      outputBuffer = await convertOfficeToJpg(inputBuffer, sourceType, dpi || 150);
      break;
    }

    // ── Single JPG → PDF ──────────────────────────────────────────────────
    case 'jpg:pdf': {
      const pdfDoc = await PDFDocument.create();
      const imgType = detectImageType(inputBuffer);
      const image = imgType === 'png'
        ? await pdfDoc.embedPng(inputBuffer)
        : await pdfDoc.embedJpg(inputBuffer);
      const { width, height } = image.scale(1);
      const pg = pdfDoc.addPage([width, height]);
      pg.drawImage(image, { x: 0, y: 0, width, height });
      outputBuffer = Buffer.from(await pdfDoc.save());
      break;
    }

    // ── Multi-image ZIP → PDF (one page per image, in upload order) ───────
    case 'zip:pdf': {
      logger.info(`[ImageWorker] Building multi-page PDF from image ZIP`);
      const images = await extractImagesFromZip(inputBuffer);
      const pdfDoc = await PDFDocument.create();

      for (const imgBuf of images) {
        const imgType = detectImageType(imgBuf);
        let image;
        try {
          image = imgType === 'png'
            ? await pdfDoc.embedPng(imgBuf)
            : await pdfDoc.embedJpg(imgBuf);
        } catch {
          logger.warn(`[ImageWorker] zip:pdf — skipping unembeddable image`);
          continue;
        }
        const { width, height } = image.scale(1);
        const pg = pdfDoc.addPage([width, height]);
        pg.drawImage(image, { x: 0, y: 0, width, height });
      }

      outputBuffer = Buffer.from(await pdfDoc.save());
      logger.info(`[ImageWorker] zip:pdf — built ${pdfDoc.getPageCount()} page(s)`);
      break;
    }

    // ── Single JPG → PPTX ─────────────────────────────────────────────────
    case 'jpg:pptx': {
      outputExt = 'pptx';
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      const slide = pptx.addSlide();
      const imgType = detectImageType(inputBuffer);
      const mimeType = imgType === 'png' ? 'image/png' : 'image/jpeg';
      slide.addImage({ data: `${mimeType};base64,${inputBuffer.toString('base64')}`, x: 0, y: 0, w: '100%', h: '100%' });
      outputBuffer = Buffer.from(await pptx.write({ outputType: 'base64' }) as string, 'base64');
      break;
    }

    // ── Multi-image ZIP → PPTX (one slide per image, in upload order) ─────
    case 'zip:pptx': {
      outputExt = 'pptx';
      logger.info(`[ImageWorker] Building multi-slide PPTX from image ZIP`);
      const images = await extractImagesFromZip(inputBuffer);
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';

      for (const imgBuf of images) {
        const imgType = detectImageType(imgBuf);
        const mimeType = imgType === 'png' ? 'image/png' : 'image/jpeg';
        const slide = pptx.addSlide();
        slide.addImage({ data: `${mimeType};base64,${imgBuf.toString('base64')}`, x: 0, y: 0, w: '100%', h: '100%' });
      }

      outputBuffer = Buffer.from(await pptx.write({ outputType: 'base64' }) as string, 'base64');
      logger.info(`[ImageWorker] zip:pptx — built ${images.length} slide(s)`);
      break;
    }

    default:
      throw new Error(`ImageWorker: unsupported conversion ${conversionKey}`);
  }

  const r2OutputKey = `output/${jobId}.${outputExt}`;
  await uploadToB2(r2OutputKey, outputBuffer);

  await updateConversionJobStatus(jobId, JOB_STATUS.COMPLETED, {
    r2OutputKey,
    completedAt: new Date(),
  });

  logger.info(`[ImageWorker] Job ${jobId} completed — output: ${r2OutputKey}`);
}
