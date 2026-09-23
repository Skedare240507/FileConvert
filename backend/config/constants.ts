/**
 * config/constants.ts
 *
 * App-wide constants for plan limits, file sizes, TTLs, and supported formats.
 * Never hard-code these values inline — always import from here.
 */

// ── Plan-tier file limits ──────────────────────────────────────────────────

export const PLAN_FILE_LIMITS = {
  free: 2,
  pro: 10,
  business: Infinity,
} as const;

export const PLAN_MERGE_FILE_LIMITS = {
  free: 0, // blocked
  pro: 10,
  business: Infinity,
} as const;

export const PLAN_MERGE_SESSIONS_PER_DAY = {
  free: 0,
  pro: 10,
  business: Infinity,
} as const;

// ── File size limits ──────────────────────────────────────────────────────

/** Maximum upload size enforced server-side (50 MB) */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** Maximum chunk size for resumable uploads (5 MB) */
export const UPLOAD_CHUNK_SIZE_BYTES = 5 * 1024 * 1024;

// ── Storage TTL ───────────────────────────────────────────────────────────

/** R2 files are deleted after this many milliseconds (1 hour) */
export const FILE_TTL_MS = 60 * 60 * 1000;

// ── Job queue ─────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  CONVERSION: 'conversion',
  MERGE: 'merge',
  SCAN: 'clamav-scan',
  CLEANUP: 'file-cleanup',
} as const;

export const JOB_MAX_RETRIES = 3;

/** Exponential backoff delays in ms: [5s, 30s, 2min] */
export const JOB_BACKOFF_DELAYS = [5_000, 30_000, 120_000];

// ── Worker types ──────────────────────────────────────────────────────────

export const WORKER_TYPES = {
  DOCUMENT: 'document',
  IMAGE: 'image',
  OCR: 'ocr',
} as const;

export type WorkerType = (typeof WORKER_TYPES)[keyof typeof WORKER_TYPES];

// ── Conversion engine identifiers ─────────────────────────────────────────

export const ENGINES = {
  GOTENBERG: 'gotenberg',
  IMAGEMAGICK: 'imagemagick',
  TESSERACT: 'tesseract',
  CLOUDCONVERT: 'cloudconvert',
  SHEETJS: 'sheetjs',
  PDF_LIB: 'pdf-lib',
  PPTX_GEN: 'pptxgen',
} as const;

export type Engine = (typeof ENGINES)[keyof typeof ENGINES];

// ── Supported MIME types ──────────────────────────────────────────────────

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

// ── Conversion routing map ────────────────────────────────────────────────

/** Maps "sourceType:targetType" → WorkerType */
export const CONVERSION_WORKER_MAP: Record<string, WorkerType> = {
  'pdf:docx': WORKER_TYPES.DOCUMENT,
  'pdf:doc': WORKER_TYPES.DOCUMENT,
  'pdf:pptx': WORKER_TYPES.DOCUMENT,
  'pdf:jpg': WORKER_TYPES.IMAGE,
  'jpg:pdf': WORKER_TYPES.IMAGE,
  'jpg:pptx': WORKER_TYPES.IMAGE,
  'xlsx:csv': WORKER_TYPES.DOCUMENT,
  'xls:csv': WORKER_TYPES.DOCUMENT,
  'csv:xlsx': WORKER_TYPES.DOCUMENT,
  'csv:xls': WORKER_TYPES.DOCUMENT,
  'docx:pdf': WORKER_TYPES.DOCUMENT,
  'doc:pdf': WORKER_TYPES.DOCUMENT,
  'docx:pptx': WORKER_TYPES.DOCUMENT,
  'doc:pptx': WORKER_TYPES.DOCUMENT,
  'docx:jpg': WORKER_TYPES.IMAGE,
  'doc:jpg': WORKER_TYPES.IMAGE,
  'pptx:pdf': WORKER_TYPES.DOCUMENT,
  'pptx:docx': WORKER_TYPES.DOCUMENT,
  'pptx:jpg': WORKER_TYPES.IMAGE,
} as const;

// ── Plans ────────────────────────────────────────────────────────────────

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

// ── Job statuses ──────────────────────────────────────────────────────────

export const JOB_STATUS = {
  QUEUED: 'queued',
  SCANNING: 'scanning',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEAD_LETTER: 'dead_letter',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
