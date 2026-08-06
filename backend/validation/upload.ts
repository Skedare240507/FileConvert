/**
 * validation/upload.ts
 *
 * Zod schemas and helpers for file upload validation.
 * Both MIME type and magic bytes must pass — an extension rename is not enough.
 */

import { z } from 'zod';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/backend/config/constants';

// ── Magic byte signatures ────────────────────────────────────────────────

const MAGIC_BYTES: Record<string, Buffer[]> = {
  pdf: [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  docx: [Buffer.from([0x50, 0x4b, 0x03, 0x04])], // PK (ZIP/Office Open XML)
  xlsx: [Buffer.from([0x50, 0x4b, 0x03, 0x04])], // PK
  pptx: [Buffer.from([0x50, 0x4b, 0x03, 0x04])], // PK
  jpg: [Buffer.from([0xff, 0xd8, 0xff])],          // JPEG SOI
  png: [Buffer.from([0x89, 0x50, 0x4e, 0x47])],   // PNG
};

/**
 * Checks the first bytes of a file buffer to verify its true type.
 * Returns true if the declared extension matches the actual magic bytes.
 */
export function verifyMagicBytes(buffer: Buffer, declaredExt: string): boolean {
  const signatures = MAGIC_BYTES[declaredExt.toLowerCase()];
  if (!signatures) return true; // Unknown ext: no magic-byte check (CSV, etc.)

  return signatures.some((sig) => buffer.slice(0, sig.length).equals(sig));
}

// ── Zod schemas ──────────────────────────────────────────────────────────

export const uploadInitSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().refine((mime) => ALLOWED_MIME_TYPES.has(mime), {
    message: 'Unsupported file type',
  }),
  fileSizeBytes: z
    .number()
    .positive()
    .max(MAX_FILE_SIZE_BYTES, `File too large — maximum is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`),
  sourceType: z.string().min(1).max(10),
  targetType: z.string().min(1).max(10),
});

export type UploadInitInput = z.infer<typeof uploadInitSchema>;
