/**
 * queue/client.ts
 *
 * Shared Redis connection used by both BullMQ queues and the rate limiter.
 * All queue and worker files import this single connection.
 *
 * The connection is stored on `globalThis` so that Next.js hot reloads
 * (Turbopack/webpack HMR) do NOT close and recreate it on every module
 * re-evaluation — which caused "Connection is closed." errors in dev.
 */

import { Redis } from 'ioredis';
import { env } from '@/backend/config/env';

// Extend globalThis so TypeScript is happy
const globalForRedis = globalThis as typeof globalThis & {
  _fcRedisConnection?: Redis;
};

function createRedisConnection(): Redis {
  const conn = new Redis(env.REDIS_URL || 'redis://localhost:6379', {
    // BullMQ requires maxRetriesPerRequest: null for blocking commands
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 5000,
    retryStrategy: (times: number) => {
      if (times > 20) return null; // give up after ~30 seconds if Redis is down
      return Math.min(times * 500, 2000);
    },
  });

  let _errorLogged = false;
  conn.on('error', (err: Error) => {
    if (!_errorLogged) {
      console.warn('[Redis] Connection unavailable — queue features disabled:', err.message);
      _errorLogged = true;
    }
  });

  conn.on('connect', () => {
    _errorLogged = false; // reset on reconnect
  });

  return conn;
}

// Reuse the existing connection across HMR reloads in dev;
// always create fresh in production (no HMR).
if (!globalForRedis._fcRedisConnection) {
  globalForRedis._fcRedisConnection = createRedisConnection();
}

export const redisConnection = globalForRedis._fcRedisConnection;
