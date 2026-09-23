/**
 * app/api/convert/jobs/[jobId]/live/route.ts
 *
 * Server-Sent Events (SSE) endpoint for real-time job progress updates.
 *
 * The client connects once and receives push events until the job reaches
 * a terminal state (completed | failed) or the connection times out.
 *
 * Event format:
 *   data: {"jobId":"...","status":"processing","progress":50}
 *
 * Usage (client-side):
 *   const es = new EventSource(`/api/convert/jobs/${jobId}/live`);
 *   es.onmessage = (e) => { const update = JSON.parse(e.data); ... };
 */

import { NextRequest } from 'next/server';
import { getConversionJobById } from '@/backend/db/queries/conversionJobs';
import { resolveTenantIdentity, canAccessResource } from '@/backend/utils/tenantSecurity';

const POLL_INTERVAL_MS = 2000;
const MAX_STREAM_DURATION_MS = 10 * 60 * 1000; // 10 minutes max

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobId) {
    return Response.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const jobRecord = await getConversionJobById(jobId);
  if (!jobRecord) {
    return Response.json({ error: 'Job not found' }, { status: 404 });
  }

  const tenant = await resolveTenantIdentity(req);
  if (!canAccessResource(jobRecord, tenant)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const encoder = new TextEncoder();
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Keep connection open comment
      controller.enqueue(encoder.encode(': ping\n\n'));

      while (true) {
        // Check for timeout
        if (Date.now() - startTime > MAX_STREAM_DURATION_MS) {
          send({ jobId, status: 'timeout', message: 'Stream timed out' });
          controller.close();
          break;
        }

        // Poll DB for job status
        let job;
        try {
          job = await getConversionJobById(jobId);
        } catch {
          send({ jobId, status: 'error', message: 'Failed to fetch job status' });
          controller.close();
          break;
        }

        if (!job) {
          send({ jobId, status: 'error', message: 'Job not found' });
          controller.close();
          break;
        }

        // Send current status
        send({
          jobId,
          status: job.status,
          sourceType: job.source_type,
          targetType: job.target_type,
          r2OutputKey: job.r2_output_key ?? null,
          createdAt: job.created_at,
          completedAt: job.completed_at ?? null,
          error: job.error_message ?? undefined,
        });

        // Close stream on terminal status
        if (job.status === 'completed' || job.status === 'failed') {
          controller.close();
          break;
        }

        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering for SSE
    },
  });
}
