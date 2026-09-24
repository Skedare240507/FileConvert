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
  connectTimeout: 2000,
  retryStrategy: (times: number) => {
    if (times > 20) return null; // give up after ~30 seconds if Redis is down
    return Math.min(times * 500, 2000);
  },
});

let _redisErrorLogged = false;
redisConnection.on('error', (err: Error) => {
  if (!_redisErrorLogged) {
    console.warn('[Redis] Connection unavailable — queue features disabled:', err.message);
    _redisErrorLogged = true;
  }
});
