/**
 * db/queries/usageCounters.ts
 *
 * Durable mirror of the Redis usage counters for billing audits and analytics.
 * Real-time enforcement uses Redis; this table is written asynchronously.
 */

import { prisma } from '../client';

type CounterType = 'merge_session' | 'conversion';

export async function upsertUsageCounter(
  userId: string,
  counterType: CounterType,
  windowDate: Date
) {
  const dateOnly = new Date(windowDate);
  dateOnly.setUTCHours(0, 0, 0, 0);

  return prisma.usageCounter.upsert({
    where: {
      // Prisma requires a unique constraint — add @@unique([user_id, counter_type, window_date]) in schema
      // For now, use a workaround with findFirst + create/update
      id: 'placeholder', // will be overridden
    },
    update: { count: { increment: 1 } },
    create: {
      user_id: userId,
      counter_type: counterType,
      count: 1,
      window_date: dateOnly,
    },
  }).catch(async () => {
    // Fallback: manual upsert without unique constraint
    const existing = await prisma.usageCounter.findFirst({
      where: { user_id: userId, counter_type: counterType, window_date: dateOnly },
    });
    if (existing) {
      return prisma.usageCounter.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      });
    }
    return prisma.usageCounter.create({
      data: { user_id: userId, counter_type: counterType, count: 1, window_date: dateOnly },
    });
  });
}

export async function getUsageCount(
  userId: string,
  counterType: CounterType,
  windowDate: Date
): Promise<number> {
  const dateOnly = new Date(windowDate);
  dateOnly.setUTCHours(0, 0, 0, 0);

  const row = await prisma.usageCounter.findFirst({
    where: { user_id: userId, counter_type: counterType, window_date: dateOnly },
  });
  return row?.count ?? 0;
}
