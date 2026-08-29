/**
 * middleware/withRateLimit.ts
 *
 * Redis-backed sliding-window rate limiter for Next.js API routes.
 *
 * Replaces the old in-memory `backend/rateLimit.ts` with a proper
 * Redis implementation that works across multiple Next.js instances.
 *
 * Usage:
 *   export const POST = withRateLimit(handler, { limit: 10, windowSec: 60 });
 *
 * The identifier is the IP address from the request headers.
 */

import { Redis } from 'ioredis';
import { env } from '@/backend/config/env';
import type { NextRequest } from 'next/server';

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  enableOfflineQueue: false,
  commandTimeout: 1000,
  retryStrategy: (times: number) => {
    if (times > 2) return null; // give up quickly
    return 1000;
  },
});
redis.on('error', () => { /* suppress ioredis connection errors — handled via try/catch below */ });

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  windowSec: number;
  /** Custom key prefix (default: 'rl') */
  prefix?: string;
}

type Handler = (req: NextRequest) => Promise<Response>;

export function withRateLimit(handler: Handler, options: RateLimitOptions): Handler {
  const { limit, windowSec, prefix = 'rl' } = options;

  return async function (req: NextRequest): Promise<Response> {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';

    const key = `${prefix}:${ip}`;

    try {
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, windowSec);
      const results = await pipeline.exec();

      const count = (results?.[0]?.[1] as number) ?? 0;

      if (count > limit) {
        return Response.json(
          { error: 'Too many requests — please slow down.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(windowSec),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }
    } catch {
      // Redis unavailable — allow the request through (fail open)
    }

    return handler(req);
  };
}
