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
import FormData from 'form-data';

const execFileAsync = promisify(execFile);

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
      const tmpId = crypto.randomUUID();
      const tmpPdfPath = path.join(os.tmpdir(), `${tmpId}.pdf`);
      const tmpJpgPrefix = path.join(os.tmpdir(), `${tmpId}_page_`);
      
      await fs.writeFile(tmpPdfPath, inputBuffer);
      
      try {
        // Run ImageMagick: convert -density 150 input.pdf output_page_%03d.jpg
        const dpiVal = dpi || 150;
        await execFileAsync('magick', ['-density', String(dpiVal), tmpPdfPath, `${tmpJpgPrefix}%03d.jpg`]);
        
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
          await fs.unlink(filePath); // clean up
        }
        
        outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      } finally {
        await fs.unlink(tmpPdfPath).catch(() => {});
      }
      break;
    }
    case 'jpg:pdf': {
      const pdfDoc = await PDFDocument.create();
      const image = await pdfDoc.embedJpg(inputBuffer);
      const { width, height } = image.scale(1);
      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
      
      const pdfBytes = await pdfDoc.save();
      outputBuffer = Buffer.from(pdfBytes);
      break;
    }
    case 'jpg:pptx': {
      outputExt = 'pptx';
      // Build a minimal HTML slide and convert via Gotenberg → LibreOffice
      const base64Img = inputBuffer.toString('base64');
      const htmlSlide = `<!DOCTYPE html><html><head><style>
        body { margin: 0; padding: 0; width: 25.4cm; height: 19.05cm; }
        img { width: 100%; height: 100%; object-fit: contain; }
      </style></head><body><img src="data:image/jpeg;base64,${base64Img}" /></body></html>`;
      const formData = new FormData();
      formData.append('files', Buffer.from(htmlSlide), { filename: 'index.html', contentType: 'text/html' });
      const gotenbergUrl = process.env.GOTENBERG_URL ?? 'http://localhost:3001';
      const res = await fetch(`${gotenbergUrl}/forms/libreoffice/convert`, {
        method: 'POST',
        body: formData as unknown as BodyInit,
        headers: formData.getHeaders(),
      });
      if (!res.ok) throw new Error(`Gotenberg pptx conversion failed: ${res.status}`);
      outputBuffer = Buffer.from(await res.arrayBuffer());
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
