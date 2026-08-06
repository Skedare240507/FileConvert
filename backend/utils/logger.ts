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
      try {
        // Dynamic import to avoid loading Sentry in dev
        import('@sentry/nextjs').then(({ captureException, captureMessage }) => {
          const errArg = args.find((a) => a instanceof Error);
          if (errArg) {
            captureException(errArg);
          } else {
            captureMessage(`${message} ${args.join(' ')}`, 'error');
          }
        });
      } catch {
        // Sentry not available — swallow silently
      }
    }
  },

  debug(message: string, ...args: unknown[]) {
    if (isDev) {
      console.debug(`[DEBUG] ${new Date().toISOString()} — ${message}`, ...args);
    }
  },
};
