/**
 * services/storage/r2.ts
 *
 * Cloudflare R2 storage service — upload, download, delete, and signed URLs.
 *
 * Uses the AWS S3-compatible SDK since R2 exposes an S3-compatible API.
 * All file I/O goes through this module; no other file touches the R2 SDK.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/backend/config/env';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.R2_BUCKET;

// ── Upload ────────────────────────────────────────────────────────────────

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<void> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType ?? 'application/octet-stream',
    })
  );
}

// ── Download ──────────────────────────────────────────────────────────────

export async function downloadFromR2(key: string): Promise<Buffer> {
  const response = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  if (!response.Body) throw new Error(`R2 object not found: ${key}`);
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// ── Delete ────────────────────────────────────────────────────────────────

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// ── Signed URLs ───────────────────────────────────────────────────────────

/** Returns a short-lived signed download URL (default: 5 minutes) */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

/** Returns a signed upload URL for direct browser → R2 uploads */
export async function getSignedUploadUrl(key: string, expiresInSeconds = 300): Promise<string> {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

// ── Resumable / chunked upload helpers ───────────────────────────────────

export async function initMultipartUpload(key: string, contentType: string): Promise<string> {
  const response = await r2.send(
    new CreateMultipartUploadCommand({ Bucket: BUCKET, Key: key, ContentType: contentType })
  );
  if (!response.UploadId) throw new Error('Failed to initiate multipart upload');
  return response.UploadId;
}

export async function uploadPart(
  key: string,
  uploadId: string,
  partNumber: number,
  body: Buffer
): Promise<string> {
  const response = await r2.send(
    new UploadPartCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId, PartNumber: partNumber, Body: body })
  );
  if (!response.ETag) throw new Error(`Part ${partNumber} upload failed`);
  return response.ETag;
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: Array<{ PartNumber: number; ETag: string }>
): Promise<void> {
  await r2.send(
    new CompleteMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
  );
}
