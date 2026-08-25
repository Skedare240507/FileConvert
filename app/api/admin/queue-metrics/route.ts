import { NextResponse } from 'next/server';
import { conversionQueue, mergeQueue, scanQueue, cleanupQueue } from '@/backend/queue/queues';

// Note: Admin routes should be protected by an auth middleware or session check.
// This is a basic implementation for the MVP.

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [conversion, merge, scan, cleanup] = await Promise.all([
      conversionQueue.getJobCounts(),
      mergeQueue.getJobCounts(),
      scanQueue.getJobCounts(),
      cleanupQueue.getJobCounts(),
    ]);

    return NextResponse.json({
      conversion,
      merge,
      scan,
      cleanup,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to fetch queue metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue metrics', details: error.message },
      { status: 500 }
    );
  }
}
