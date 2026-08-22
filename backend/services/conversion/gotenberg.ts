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

  // Gotenberg accepts a nativePdfFormat option for better fidelity
  if (targetType === 'pdf') {
    form.append('nativePdfFormat', 'PDF/A-2b');
  }

  logger.info(`[Gotenberg] Converting ${sourceType} → ${targetType}`);

  const response = await fetch(url, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(120_000), // 2-minute timeout for large files
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gotenberg error ${response.status}: ${text}`);
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
