/**
 * db/client.ts
 *
 * Singleton Prisma client — safe for both development (hot-reload) and
 * production. Moved from the old backend/db.ts; update all imports to point
 * here: `import { prisma } from '@/backend/db/client'`
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
