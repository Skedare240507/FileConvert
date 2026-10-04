/**
 * utils/logger.ts
 *
 * Structured logger that wraps console in development and forwards
 * errors to Sentry in production.
 *
 * Usage:
 *   import { logger } from '@/backend/utils/logger';
 *   logger.info('Job started', { jobId });
 *   logger.error('Job failed', err);
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info(message: string, ...args: unknown[]) {
    console.info(`[INFO]  ${new Date().toISOString()} — ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN]  ${new Date().toISOString()} — ${message}`, ...args);
  },

  error(message: string, ...args: unknown[]) {
    console.error(`[ERROR] ${new Date().toISOString()} — ${message}`, ...args);

    // Forward to Sentry in production
    if (!isDev) {
      // Use @sentry/node in worker/server contexts; @sentry/nextjs re-exports it
      // but may not be available in a plain Node.js environment.
      Promise.resolve()
        .then(() => import('@sentry/node'))
        .catch(() => import('@sentry/nextjs'))
        .then((Sentry) => {
          const captureException =
            (Sentry as Record<string, unknown>).captureException as
              | ((e: unknown) => void)
              | undefined;
          const captureMessage =
            (Sentry as Record<string, unknown>).captureMessage as
              | ((m: string, l: string) => void)
              | undefined;

          const errArg = args.find((a) => a instanceof Error);
          if (errArg && typeof captureException === 'function') {
            captureException(errArg);
          } else if (typeof captureMessage === 'function') {
            captureMessage(`${message} ${args.join(' ')}`, 'error');
          }
        })
        .catch(() => {
          // Sentry not available — swallow silently
        });
    }
  },

  debug(message: string, ...args: unknown[]) {
    if (isDev) {
      console.debug(`[DEBUG] ${new Date().toISOString()} — ${message}`, ...args);
    }
  },
};
