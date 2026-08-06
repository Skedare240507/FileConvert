# Backend — FileConvert v2.0

This directory contains **all backend-specific logic** used by the Next.js API routes and worker services.

## Folder Structure

```
backend/
├── config/              # Centralised environment & service configs
│   ├── env.ts           # Validated env variable access (throws early if missing)
│   └── constants.ts     # App-wide constants (file limits, TTLs, plan tiers)
│
├── db/                  # Database layer (Prisma)
│   ├── client.ts        # Singleton Prisma client (moved from db.ts)
│   └── queries/         # Reusable typed query helpers per model
│       ├── users.ts
│       ├── conversionJobs.ts
│       ├── mergeSessions.ts
│       ├── usageCounters.ts
│       ├── feedback.ts
│       └── auditLogs.ts
│
├── queue/               # BullMQ job queue setup
│   ├── client.ts        # Redis connection for BullMQ
│   ├── queues.ts        # Queue definitions (conversion, merge, scan, cleanup)
│   └── jobs/            # Job payload type definitions
│       ├── conversionJob.ts
│       ├── mergeJob.ts
│       └── cleanupJob.ts
│
├── workers/             # BullMQ worker processors (run on VM 2)
│   ├── orchestrator.ts  # Routes jobs to the correct worker based on type
│   ├── documentWorker.ts  # PDF/Word/PPT via Gotenberg
│   ├── imageWorker.ts     # JPG/PDF/PPT via ImageMagick / pdf-lib / pptx
│   ├── ocrWorker.ts       # Tesseract OCR for scanned PDFs/images
│   └── cleanupWorker.ts   # Scheduled R2 file deletion after 1-hour TTL
│
├── services/            # Business logic — pure functions, no HTTP knowledge
│   ├── storage/
│   │   └── r2.ts        # Cloudflare R2 upload, download, delete, signed URLs
│   ├── scan/
│   │   └── clamav.ts    # ClamAV malware scan before any worker runs
│   ├── conversion/
│   │   ├── gotenberg.ts # Gotenberg HTTP client helpers
│   │   ├── imagemagick.ts
│   │   ├── sheetjs.ts   # Excel ↔ CSV conversions
│   │   └── fallback.ts  # CloudConvert emergency fallback
│   ├── payment/
│   │   └── razorpay.ts  # Order creation, signature verification, webhook handling
│   └── email/
│       └── mailer.ts    # Nodemailer transactional email (OTP, receipts)
│
├── middleware/          # Next.js route middleware helpers
│   ├── withAuth.ts      # Session + plan-tier injection for protected routes
│   ├── withRateLimit.ts # Redis sliding-window rate limiter (replaces in-memory)
│   └── withAdminAuth.ts # Admin-only route guard + audit log on access
│
├── validation/          # Zod schemas for request body + file validation
│   ├── upload.ts        # MIME type, magic bytes, file size rules
│   ├── conversion.ts    # Conversion job request schema
│   ├── merge.ts         # Merge session request schema
│   └── payment.ts       # Payment / webhook request schema
│
└── utils/               # Shared utility functions
    ├── fileType.ts      # Magic-bytes based true file-type detection
    ├── sanitize.ts      # Filename sanitisation (path traversal prevention)
    ├── planLimits.ts    # Plan-tier limit enforcement helpers
    └── logger.ts        # Structured logger (wraps console / Sentry)
```

## Key Rules

- **No HTTP logic here** — no `NextRequest`, no `res.json()`. HTTP is handled in `app/api/`.
- **All env access** goes through `config/env.ts` — never `process.env.X` inline.
- **All DB access** goes through `db/queries/` helpers — never raw Prisma calls in API routes.
- **Workers** in `workers/` are meant to run as separate Node processes on VM 2.
