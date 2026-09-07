import { NextResponse } from 'next/server';
import { conversionQueue, mergeQueue, scanQueue, cleanupQueue } from '@/backend/queue/queues';
import { withAdminAuth } from '@/backend/middleware/withAdminAuth';

export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async () => {
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
});
