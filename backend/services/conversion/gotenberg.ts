/**
 * services/conversion/gotenberg.ts
 *
 * Gotenberg HTTP client — handles all LibreOffice-backed conversions.
 *
 * Gotenberg is a Docker service exposing an HTTP API for PDF, Word, and PPT
 * conversions. This module wraps those HTTP calls with typed helpers.
 *
 * Docs: https://gotenberg.dev/docs/routes
 */

import { env } from '@/backend/config/env';
import { logger } from '@/backend/utils/logger';

const GOTENBERG_BASE = env.GOTENBERG_URL;

type LibreOfficeRoute = '/forms/libreoffice/convert';

/**
 * Converts a document buffer using Gotenberg's LibreOffice route.
 *
 * @param inputBuffer - The file to convert
 * @param sourceType  - e.g. 'pdf', 'docx'
 * @param targetType  - e.g. 'docx', 'pdf', 'pptx'
 * @returns The converted file as a Buffer
 */
export async function convertWithGotenberg(
  inputBuffer: Buffer,
  sourceType: string,
  targetType: string
): Promise<Buffer> {
  const route: LibreOfficeRoute = '/forms/libreoffice/convert';
  const url = `${GOTENBERG_BASE}${route}`;

  const form = new FormData();
  form.append('files', new Blob([new Uint8Array(inputBuffer)], { type: getMimeType(sourceType) }), `input.${sourceType}`);

  // Tell Gotenberg (LibreOffice) the desired output format via file extension
  form.append('outputFilename', `output.${targetType}`);

  // Gotenberg accepts a nativePdfFormat option for better fidelity when converting TO pdf
  if (targetType === 'pdf') {
    form.append('nativePdfFormat', 'PDF/A-2b');
  }

  logger.info(`[Gotenberg] Converting ${sourceType} -> ${targetType}`);

  const response = await fetch(url, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gotenberg error ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Merges multiple files into a single PDF using Gotenberg.
 *
 * @param inputBuffers - Array of file buffers to merge
 * @param sourceType  - e.g. 'pdf', 'docx', 'pptx'
 * @returns The merged PDF as a Buffer
 */
export async function mergeWithGotenberg(
  inputBuffers: Buffer[],
  sourceType: string
): Promise<Buffer> {
  const isPdf = sourceType === 'pdf';
  const route = isPdf ? '/forms/pdfengines/merge' : '/forms/libreoffice/convert';
  const url = `${GOTENBERG_BASE}${route}`;

  const form = new FormData();
  
  // Append files in order. Gotenberg processes them in alphabetical order of filename.
  // We use padded numbers to ensure correct merge order (e.g. 00.pdf, 01.pdf)
  inputBuffers.forEach((buffer, index) => {
    const filename = `${String(index).padStart(2, '0')}.${sourceType}`;
    form.append('files', new Blob([new Uint8Array(buffer)], { type: getMimeType(sourceType) }), filename);
  });

  if (!isPdf) {
    // For LibreOffice, we must tell it to merge the converted PDFs
    form.append('merge', 'true');
    form.append('outputFilename', 'merged.pdf');
    form.append('nativePdfFormat', 'PDF/A-2b');
  }

  logger.info(`[Gotenberg] Merging ${inputBuffers.length} ${sourceType} files -> pdf`);

  const response = await fetch(url, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(180_000), // 3 min timeout for merges
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gotenberg merge error ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
  };
  return mimeMap[ext] ?? 'application/octet-stream';
}
