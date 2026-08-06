/**
 * config/env.ts
 *
 * Single, validated access point for every environment variable the backend
 * touches. The module throws at import time (server startup) if a required
 * variable is missing, so misconfigurations surface immediately rather than
 * during the first request.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback;
}

export const env = {
  // ── Supabase ──────────────────────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: required('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: required('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),

  // ── Prisma / Postgres ─────────────────────────────────────────────────────
  DATABASE_URL: required('DATABASE_URL'),

  // ── NextAuth ──────────────────────────────────────────────────────────────
  NEXTAUTH_SECRET: required('NEXTAUTH_SECRET'),
  NEXTAUTH_URL: optional('NEXTAUTH_URL', 'http://localhost:3000'),

  // ── Google OAuth ──────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),

  // ── Cloudflare R2 ─────────────────────────────────────────────────────────
  R2_ACCOUNT_ID: required('R2_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID: required('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: required('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET: required('R2_BUCKET'),

  // ── Redis ─────────────────────────────────────────────────────────────────
  REDIS_URL: required('REDIS_URL'),

  // ── Gotenberg (Document Worker) ───────────────────────────────────────────
  GOTENBERG_URL: optional('GOTENBERG_URL', 'http://localhost:3000'),

  // ── ClamAV ────────────────────────────────────────────────────────────────
  CLAMAV_HOST: optional('CLAMAV_HOST', 'localhost'),
  CLAMAV_PORT: optional('CLAMAV_PORT', '3310'),

  // ── Orchestrator ──────────────────────────────────────────────────────────
  ORCHESTRATOR_URL: optional('ORCHESTRATOR_URL', 'http://localhost:4000'),

  // ── CloudConvert (emergency fallback only) ────────────────────────────────
  CLOUDCONVERT_API_KEY: optional('CLOUDCONVERT_API_KEY'),

  // ── Razorpay ──────────────────────────────────────────────────────────────
  RAZORPAY_KEY_ID: required('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: required('RAZORPAY_KEY_SECRET'),
  RAZORPAY_WEBHOOK_SECRET: required('RAZORPAY_WEBHOOK_SECRET'),

  // ── Sentry ────────────────────────────────────────────────────────────────
  SENTRY_DSN: optional('SENTRY_DSN'),

  // ── Email (Nodemailer) ────────────────────────────────────────────────────
  SMTP_HOST: optional('SMTP_HOST'),
  SMTP_PORT: optional('SMTP_PORT', '587'),
  SMTP_USER: optional('SMTP_USER'),
  SMTP_PASS: optional('SMTP_PASS'),
  SMTP_FROM: optional('SMTP_FROM', 'noreply@fileconvert.app'),

  // ── Node environment ──────────────────────────────────────────────────────
  NODE_ENV: optional('NODE_ENV', 'development'),
} as const;
