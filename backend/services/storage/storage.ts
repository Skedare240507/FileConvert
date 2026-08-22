/**
 * services/storage/storage.ts
 *
 * Backblaze B2 storage service — upload, download, delete, and signed URLs.
 *
 * Backblaze B2 exposes an S3-compatible API, so we use the standard AWS SDK.
 * All file I/O goes through this module; no other file touches the S3 SDK.
 *
 * Required environment variables:
 *   B2_ENDPOINT          e.g. https://s3.us-west-004.backblazeb2.com
 *   B2_REGION            e.g. us-west-004
 *   B2_ACCESS_KEY_ID     Application Key ID from the B2 console
 *   B2_SECRET_ACCESS_KEY Application Key from the B2 console
 *   B2_BUCKET            Bucket name
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

const b2 = new S3Client({
  region: env.B2_REGION,
  endpoint: env.B2_ENDPOINT,
  credentials: {
    accessKeyId: env.B2_ACCESS_KEY_ID,
    secretAccessKey: env.B2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = env.B2_BUCKET;

// ── Upload ────────────────────────────────────────────────────────────────

export async function uploadToB2(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<void> {
  await b2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType ?? 'application/octet-stream',
    })
  );
}

// ── Download ──────────────────────────────────────────────────────────────

export async function downloadFromB2(key: string): Promise<Buffer> {
  const response = await b2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  if (!response.Body) throw new Error(`B2 object not found: ${key}`);
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// ── Delete ────────────────────────────────────────────────────────────────

export async function deleteFromB2(key: string): Promise<void> {
  await b2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// ── Signed URLs ───────────────────────────────────────────────────────────

/** Returns a short-lived signed download URL (default: 5 minutes) */
export async function getSignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
  return getSignedUrl(
    b2,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

/** Returns a signed upload URL for direct browser -> B2 uploads */
export async function getSignedUploadUrl(key: string, expiresInSeconds = 300): Promise<string> {
  return getSignedUrl(
    b2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

// ── Resumable / chunked upload helpers ───────────────────────────────────

export async function initMultipartUpload(key: string, contentType: string): Promise<string> {
  const response = await b2.send(
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
  const response = await b2.send(
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
  await b2.send(
    new CompleteMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
  );
}
