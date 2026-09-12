import { NextRequest } from 'next/server';
import { getMergeSessionById } from '@/backend/db/queries/mergeSessions';
import { resolveTenantIdentity, canAccessResource } from '@/backend/utils/tenantSecurity';

const POLL_INTERVAL_MS = 2000;
const MAX_STREAM_DURATION_MS = 10 * 60 * 1000; // 10 minutes max

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return Response.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const sessionRecord = await getMergeSessionById(sessionId);
  if (!sessionRecord) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  const tenant = await resolveTenantIdentity(req);
  if (!canAccessResource(sessionRecord, tenant)) {
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
          send({ sessionId, status: 'timeout', message: 'Stream timed out' });
          controller.close();
          break;
        }

        // Poll DB for job status
        let session;
        try {
          session = await getMergeSessionById(sessionId);
        } catch {
          send({ sessionId, status: 'error', message: 'Failed to fetch session status' });
          controller.close();
          break;
        }

        if (!session) {
          send({ sessionId, status: 'error', message: 'Session not found' });
          controller.close();
          break;
        }

        // Send current status
        send({
          sessionId,
          status: session.status,
          fileType: session.file_type,
          r2OutputKey: session.r2_output_key ?? null,
          createdAt: session.created_at,
        });

        // Close stream on terminal status
        if (session.status === 'completed' || session.status === 'failed') {
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
