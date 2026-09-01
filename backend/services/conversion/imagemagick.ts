/**
 * services/conversion/imagemagick.ts
 *
 * NOTE: Image conversion logic (PDF → JPG, JPG → PDF, JPG → PPT) lives
 * directly in `backend/workers/imageWorker.ts` using the child_process exec
 * approach with ImageMagick, pdf-lib, and Gotenberg.
 *
 * This file is intentionally a thin re-export so the module path resolves
 * cleanly if imported. All real logic is in imageWorker.ts.
 */

export { };
