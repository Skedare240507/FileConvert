type RateLimitInfo = {
  count: number;
  resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitInfo>();

/**
 * Basic in-memory rate limiter.
 * @param identifier The unique identifier (e.g. IP address or Email)
 * @param limit Max requests allowed
 * @param windowMs Time window in milliseconds
 * @returns boolean True if allowed, false if rate limited
 */
export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const info = rateLimitMap.get(identifier);

  if (!info) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > info.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (info.count >= limit) {
    return false;
  }

  info.count += 1;
  return true;
}

// Cleanup expired entries to prevent memory leak
if (typeof setInterval !== 'undefined') {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, info] of rateLimitMap.entries()) {
      if (now > info.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60 * 1000);
  if (interval.unref) interval.unref();
}
