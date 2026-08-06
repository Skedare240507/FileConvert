/**
 * db/queries/auditLogs.ts
 *
 * Typed query helpers for the `audit_logs` table.
 * Exposed to Business-plan users and the admin dashboard.
 */

import { prisma } from '../client';

export type AuditAction =
  | 'plan_upgraded'
  | 'plan_cancelled'
  | 'plan_downgraded'
  | 'admin_login'
  | 'job_force_retried'
  | 'payment_verified'
  | 'webhook_received'
  | 'user_registered'
  | 'user_login'
  | 'file_uploaded'
  | 'file_downloaded';

export async function writeAuditLog(
  action: AuditAction,
  metadata?: Record<string, unknown>,
  userId?: string
) {
  return prisma.auditLog.create({
    data: {
      user_id: userId ?? null,
      action,
      metadata: (metadata ?? {}) as any,
    },
  });
}

export async function getAuditLogs(filters?: {
  userId?: string;
  action?: AuditAction;
  from?: Date;
  to?: Date;
  limit?: number;
}) {
  return prisma.auditLog.findMany({
    where: {
      ...(filters?.userId && { user_id: filters.userId }),
      ...(filters?.action && { action: filters.action }),
      ...(filters?.from || filters?.to
        ? {
            created_at: {
              ...(filters.from && { gte: filters.from }),
              ...(filters.to && { lte: filters.to }),
            },
          }
        : {}),
    },
    orderBy: { created_at: 'desc' },
    take: filters?.limit ?? 100,
  });
}
