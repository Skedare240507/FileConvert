/**
 * utils/sanitize.ts
 *
 * Filename sanitisation to prevent path traversal attacks.
 * Applied before any filename is used in an R2 key or filesystem path.
 */

import path from 'path';

/**
 * Sanitises a user-supplied filename:
 * - Strips path components (directory traversal)
 * - Removes non-ASCII and shell-special characters
 * - Trims leading dots (hidden files on Unix)
 * - Enforces a max length of 200 characters
 */
export function sanitizeFilename(filename: string): string {
  // 1. Take only the basename — strip any directory components
  let safe = path.basename(filename);

  // 2. Remove path traversal sequences just in case
  safe = safe.replace(/\.\./g, '');

  // 3. Allow only alphanumerics, hyphens, underscores, dots
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');

  // 4. Strip leading dots (hidden-file prevention)
  safe = safe.replace(/^\.+/, '');

  // 5. Enforce max length (preserve extension)
  if (safe.length > 200) {
    const ext = path.extname(safe);
    safe = safe.slice(0, 200 - ext.length) + ext;
  }

  return safe || 'file';
}

/**
 * Builds a safe R2 object key from a user id and sanitised filename.
 * Format: `uploads/<userId>/<timestamp>-<sanitisedFilename>`
 */
export function buildR2UploadKey(userId: string, filename: string): string {
  const safe = sanitizeFilename(filename);
  const ts = Date.now();
  return `uploads/${userId}/${ts}-${safe}`;
}
