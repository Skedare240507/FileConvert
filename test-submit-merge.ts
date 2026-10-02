import { env } from './backend/config/env';
import { mergeQueue } from './backend/queue/queues';
import { redisConnection } from './backend/queue/client';

async function test() {
  const jobId = await mergeQueue.add('mergeJob', {
    sessionId: 'test-session',
    userId: null,
    fileType: 'pdf',
    r2InputKeys: ['doesnt-exist-1', 'doesnt-exist-2'],
    plan: 'free',
  });
  console.log('Added job', jobId.id);
  redisConnection.disconnect();
}
test();
