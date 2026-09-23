/**
 * workers/imageWorker.ts
 *
 * Processes image conversion jobs:
 *   PDF → JPG  (poppler / libvips, multi-page → ZIP)
 *   JPG → PDF  (pdf-lib, multi-image → multi-page PDF)
 *   JPG → PPT  (Gotenberg/LibreOffice, one slide per image)
 *
 * Primary engine: ImageMagick / libvips / pdf-lib / pptxgen
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
  // Check Windows portable install first
  const winPath = `${process.env.USERPROFILE ?? ''}\\ImageMagick\\magick.exe`;
  try {
    if (process.platform === 'win32' && require('fs').existsSync(winPath)) {
      return winPath;
    }
  } catch { /* ignore */ }

  // On Linux/Docker, ImageMagick 6 uses 'convert'; IM7 uses 'magick'
  // Prefer 'magick' if it exists on PATH, else fall back to 'convert'
  return process.platform === 'win32' ? 'magick' : 'convert';
}

async function renderPdfToJpgZip(pdfBuffer: Buffer, dpiVal: number = 150): Promise<Buffer> {
  const tmpId = crypto.randomUUID();
  const tmpPdfPath = path.join(os.tmpdir(), `${tmpId}.pdf`);
  const tmpJpgPrefix = path.join(os.tmpdir(), `${tmpId}_page_`);
  
  await fs.writeFile(tmpPdfPath, pdfBuffer);
  
  try {
    // Run ImageMagick: magick -density 150 input.pdf output_page_%03d.jpg
    await execFileAsync(getMagickBin(), ['-density', String(dpiVal), tmpPdfPath, `${tmpJpgPrefix}%03d.jpg`]);
    
    // Find all generated jpg files
    const files = await fs.readdir(os.tmpdir());
    const generatedJpgs = files.filter(f => f.startsWith(`${tmpId}_page_`) && f.endsWith('.jpg'));
    
    if (generatedJpgs.length === 0) {
      throw new Error('ImageMagick generated no files');
    }
    
    const zip = new JSZip();
    for (const file of generatedJpgs) {
      const filePath = path.join(os.tmpdir(), file);
      const fileData = await fs.readFile(filePath);
      zip.file(file, fileData);
      await fs.unlink(filePath).catch(() => {});
    }
    
    return await zip.generateAsync({ type: 'nodebuffer' });
  } finally {
    await fs.unlink(tmpPdfPath).catch(() => {});
  }
}

export async function processImageJob(job: Job<ConversionJobPayload>): Promise<void> {
  const { jobId, sourceType, targetType, r2InputKey, dpi } = job.data;
  const conversionKey = `${sourceType}:${targetType}`;

  logger.info(`[ImageWorker] Processing ${conversionKey} for job ${jobId}`);

  const inputBuffer = await downloadFromB2(r2InputKey);
  let outputBuffer: Buffer;
  let outputExt = targetType;

  switch (conversionKey) {
    case 'pdf:jpg': {
      outputExt = 'zip';
      outputBuffer = await renderPdfToJpgZip(inputBuffer, dpi || 150);
      break;
    }
    case 'docx:jpg':
    case 'doc:jpg':
    case 'pptx:jpg': {
      outputExt = 'zip';
      logger.info(`[ImageWorker] Converting ${sourceType} to intermediate PDF via Gotenberg`);
      const { convertWithGotenberg } = await import('@/backend/services/conversion/gotenberg');
      const intermediatePdf = await convertWithGotenberg(inputBuffer, sourceType, 'pdf');
      outputBuffer = await renderPdfToJpgZip(intermediatePdf, dpi || 150);
      break;
    }
    case 'jpg:pdf': {
      const pdfDoc = await PDFDocument.create();
      const isPng =
        inputBuffer.length >= 8 &&
        inputBuffer[0] === 0x89 &&
        inputBuffer[1] === 0x50 &&
        inputBuffer[2] === 0x4e &&
        inputBuffer[3] === 0x47;

      const image = isPng
        ? await pdfDoc.embedPng(inputBuffer)
        : await pdfDoc.embedJpg(inputBuffer);

      const { width, height } = image.scale(1);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
      
      const pdfBytes = await pdfDoc.save();
      outputBuffer = Buffer.from(pdfBytes);
      break;
    }
    case 'jpg:pptx': {
      outputExt = 'pptx';
      // Build a valid PPTX directly with pptxgenjs — embed the image as a full-slide background.
      // This avoids the broken Gotenberg/LibreOffice HTML→PPTX path.
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      const slide = pptx.addSlide();
      const isPng =
        inputBuffer.length >= 8 &&
        inputBuffer[0] === 0x89 &&
        inputBuffer[1] === 0x50 &&
        inputBuffer[2] === 0x4e &&
        inputBuffer[3] === 0x47;
      const mimeType = isPng ? 'image/png' : 'image/jpeg';
      const base64Img = inputBuffer.toString('base64');
      slide.addImage({ data: `data:${mimeType};base64,${base64Img}`, x: 0, y: 0, w: '100%', h: '100%' });
      const base64Output = await pptx.write({ outputType: 'base64' }) as string;
      outputBuffer = Buffer.from(base64Output, 'base64');
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
