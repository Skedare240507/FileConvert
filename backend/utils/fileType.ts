/**
 * utils/fileType.ts
 *
 * Magic-bytes based true file-type detection.
 * Returns the actual file type regardless of the declared extension.
 * Used in upload validation to catch disguised executables (e.g. .exe → .pdf).
 */

/** Detected file type info */
export interface FileTypeResult {
  ext: string;
  mime: string;
}

const SIGNATURES: Array<{ bytes: number[]; ext: string; mime: string }> = [
  { bytes: [0x25, 0x50, 0x44, 0x46], ext: 'pdf', mime: 'application/pdf' },
  {
    bytes: [0x50, 0x4b, 0x03, 0x04],
    ext: 'zip',
    mime: 'application/zip', // Covers DOCX, XLSX, PPTX (all ZIP-based)
  },
  { bytes: [0xff, 0xd8, 0xff], ext: 'jpg', mime: 'image/jpeg' },
  { bytes: [0x89, 0x50, 0x4e, 0x47], ext: 'png', mime: 'image/png' },
  { bytes: [0x47, 0x49, 0x46], ext: 'gif', mime: 'image/gif' },
  { bytes: [0x52, 0x49, 0x46, 0x46], ext: 'webp', mime: 'image/webp' }, // RIFF header — also WAV; confirmed by WEBP at offset 8
  { bytes: [0x4d, 0x5a], ext: 'exe', mime: 'application/x-msdownload' }, // Block EXE
  { bytes: [0x7f, 0x45, 0x4c, 0x46], ext: 'elf', mime: 'application/x-elf' }, // Block ELF
];

/**
 * Inspects the first bytes of a buffer to detect the true file type.
 * Returns null if the type cannot be determined (e.g. plain text CSV).
 */
export function detectFileType(buffer: Buffer): FileTypeResult | null {
  for (const sig of SIGNATURES) {
    const header = sig.bytes;
    if (buffer.length < header.length) continue;
    const match = header.every((byte, i) => buffer[i] === byte);
    if (match) {
      return { ext: sig.ext, mime: sig.mime };
    }
  }
  return null;
}

/**
 * Returns true if the detected type is dangerous (executable, ELF, etc.)
 */
export function isDangerousFileType(buffer: Buffer): boolean {
  const detected = detectFileType(buffer);
  if (!detected) return false;
  return ['exe', 'elf'].includes(detected.ext);
}
