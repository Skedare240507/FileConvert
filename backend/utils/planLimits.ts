/**
 * utils/planLimits.ts
 *
 * Plan-tier limit enforcement helpers.
 * All limit checks go through these functions — never inline conditionals.
 */

import type { Plan } from '@/backend/config/constants';
import {
  PLAN_FILE_LIMITS,
  PLAN_MERGE_FILE_LIMITS,
  PLAN_MERGE_SESSIONS_PER_DAY,
} from '@/backend/config/constants';

/**
 * Returns true if the user's plan allows this many files in a single
 * conversion session.
 */
export function canConvertFiles(plan: Plan, fileCount: number): boolean {
  const limit = PLAN_FILE_LIMITS[plan];
  return fileCount <= limit;
}

/**
 * Returns true if the user's plan allows file merging at all.
 */
export function canUseMerge(plan: Plan): boolean {
  return PLAN_MERGE_FILE_LIMITS[plan] > 0;
}

/**
 * Returns true if the user's plan allows this many files in a single merge.
 */
export function canMergeFiles(plan: Plan, fileCount: number): boolean {
  const limit = PLAN_MERGE_FILE_LIMITS[plan];
  return fileCount <= limit;
}

/**
 * Returns true if the user has not exceeded their daily merge session cap.
 * `currentDailySessions` should come from the Redis counter (real-time) or
 * the usage_counters table (billing audit).
 */
export function canStartMergeSession(plan: Plan, currentDailySessions: number): boolean {
  const limit = PLAN_MERGE_SESSIONS_PER_DAY[plan];
  if (limit === Infinity) return true;
  return currentDailySessions < limit;
}

/**
 * Returns a human-readable upgrade prompt for a given limit violation.
 */
export function getUpgradeMessage(reason: 'file_count' | 'merge_access' | 'merge_session'): string {
  switch (reason) {
    case 'file_count':
      return 'Free accounts are limited to 2 files per session. Upgrade to Pro for up to 10 files.';
    case 'merge_access':
      return 'File merging is a Pro and Business feature. Upgrade to merge multiple files.';
    case 'merge_session':
      return 'You have reached your daily merge session limit. Upgrade to Business for unlimited sessions.';
  }
}
