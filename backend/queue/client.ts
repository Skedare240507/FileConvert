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
  lazyConnect: true,
  // Don't spam reconnect attempts — let Docker handle availability
  retryStrategy: (times: number) => {
    if (times > 3) return null; // stop retrying after 3 attempts
    return Math.min(times * 500, 3000);
  },
});

let _redisErrorLogged = false;
redisConnection.on('error', (err: Error) => {
  if (!_redisErrorLogged) {
    console.warn('[Redis] Connection unavailable — queue features disabled:', err.message);
    _redisErrorLogged = true;
  }
});
