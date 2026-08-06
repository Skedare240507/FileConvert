/**
 * queue/client.ts
 *
 * Shared Redis connection used by both BullMQ queues and the rate limiter.
 * All queue and worker files import this single connection.
 */

import { Redis } from 'ioredis';
import { env } from '@/backend/config/env';

// BullMQ requires maxRetriesPerRequest: null for blocking commands
export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('error', (err: Error) => {
  console.error('[Redis] Connection error:', err.message);
});
