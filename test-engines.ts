import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { PDFDocument, rgb } from 'pdf-lib';
import { convertExcelCsv } from './backend/services/conversion/sheetjs';
import { convertPdfToDocx } from './backend/services/conversion/pdf2docx';
import { convertPdfToPptx } from './backend/services/conversion/pdf2pptx';
import { convertWithGotenberg } from './backend/services/conversion/gotenberg';
import { execFile } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import os from 'os';

const execFileAsync = promisify(execFile);

// Stub getMagickBin since we can't easily import imageWorker without DB deps
function getMagickBin(): string {
  const winPath = `${process.env.USERPROFILE ?? ''}\\ImageMagick\\magick.exe`;
  try {
    if (process.platform === 'win32' && require('fs').existsSync(winPath)) return winPath;
  } catch {}
  return process.platform === 'win32' ? 'magick' : 'convert';
}

async function renderPdfToJpgZip(pdfBuffer: Buffer, dpiVal: number = 150): Promise<Buffer> {
  const tmpId = crypto.randomUUID();
  const tmpPdfPath = path.join(os.tmpdir(), `${tmpId}.pdf`);
  const tmpJpgPrefix = path.join(os.tmpdir(), `${tmpId}_page_`);
  await fs.writeFile(tmpPdfPath, pdfBuffer);
  try {
    await execFileAsync(getMagickBin(), ['-density', String(dpiVal), tmpPdfPath, `${tmpJpgPrefix}%03d.jpg`]);
    const files = await fs.readdir(os.tmpdir());
    const generatedJpgs = files.filter(f => f.startsWith(`${tmpId}_page_`) && f.endsWith('.jpg'));
    if (generatedJpgs.length === 0) throw new Error('ImageMagick generated no files');
    const zip = new JSZip();
    for (const file of generatedJpgs) {
      const filePath = path.join(os.tmpdir(), file);
      zip.file(file, await fs.readFile(filePath));
      await fs.unlink(filePath).catch(() => {});
    }
    return await zip.generateAsync({ type: 'nodebuffer' });
  } finally {
    await fs.unlink(tmpPdfPath).catch(() => {});
  }
}

async function generateTestPdf(): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([500, 500]);
  page.drawText('Hello World from Test!', { x: 50, y: 400, size: 24, color: rgb(0, 0, 0) });
  return Buffer.from(await pdfDoc.save());
}

async function runTests() {
  console.log('Starting Engine Tests...');
  const outDir = path.join(process.cwd(), 'test_output');
  await fs.mkdir(outDir, { recursive: true });

  try {
    console.log('1. Generating Test PDF...');
    const pdfBuf = await generateTestPdf();
    await fs.writeFile(path.join(outDir, 'test.pdf'), pdfBuf);
    console.log('  -> OK');

    console.log('2. Testing Gotenberg (PDF -> DOCX check via pdf2docx microservice)...');
    process.env.PDF_CONVERTER_URL = 'http://localhost:8080';
    try {
        const docxBuf = await convertPdfToDocx(pdfBuf);
        await fs.writeFile(path.join(outDir, 'test.docx'), docxBuf);
        console.log('  -> OK');
    } catch(e: any) {
        console.log('  -> FAILED:', e.message);
    }

    console.log('3. Testing pdf2pptx (Gotenberg LibO PNG -> pptxgenjs)...');
    process.env.GOTENBERG_URL = 'http://localhost:3001';
    try {
        const pptxBuf = await convertPdfToPptx(pdfBuf);
        await fs.writeFile(path.join(outDir, 'test.pptx'), pptxBuf);
        console.log('  -> OK');
    } catch(e: any) {
        console.log('  -> FAILED:', e.message);
    }

    console.log('4. Testing ImageMagick (PDF -> JPG Zip)...');
    try {
        const zipBuf = await renderPdfToJpgZip(pdfBuf);
        await fs.writeFile(path.join(outDir, 'test.zip'), zipBuf);
        console.log('  -> OK');
    } catch(e: any) {
        console.log('  -> FAILED:', e.message);
    }

    console.log('5. Testing SheetJS (CSV -> XLSX)...');
    try {
        const csvBuf = Buffer.from('name,age\nAlice,30\nBob,25');
        const xlsxBuf = await convertExcelCsv(csvBuf, 'csv', 'xlsx');
        await fs.writeFile(path.join(outDir, 'test.xlsx'), xlsxBuf);
        console.log('  -> OK');
    } catch(e: any) {
        console.log('  -> FAILED:', e.message);
    }

    console.log('All tests completed.');
  } catch (err) {
    console.error('Fatal Test Error:', err);
  }
}

runTests();
