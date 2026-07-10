# FileConvert — Complete Documentation

## Part 1: Product Requirements Document (PRD) v1.1

---

# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# FileConvert
## File Conversion SaaS Platform — Solo Developer Build

**Version:** 1.1 (Consolidated)  
**Date:** June 2026  
**Status:** Final — Ready for Development  
**Author:** Product Owner / Solo Developer  
**Tech Stack:** Next.js 14 | Node.js | Gotenberg | Cloudflare R2 | Supabase  
**Pricing:** Free | Pro: ₹89/month | Business: ₹150/month  
**Companion Doc:** See FileConvert — Technical Requirements Document (TRD) v1.0

---

## Table of Contents (PRD)

1. Product Overview
2. Scope & Constraints
3. Feature Specifications
4. Website Structure & UX
5. Pricing & Plans
6. Security & Trust Requirements
7. Release Roadmap Summary
8. Risk Register
9. Appendix — Glossary

---

## 1. Product Overview

### 1.1 Executive Summary

FileConvert is a web-based SaaS platform for converting, merging, and managing documents across PDF, Word, JPG, Excel, CSV, and PowerPoint formats. It targets students, freelancers, and small businesses who need a fast, reliable, and secure conversion tool without installing expensive desktop software or fighting through ad-heavy free sites.

### 1.2 Problem Statement

- Users need quick, reliable file format conversions without installing software.
- Most free online converters are unreliable, serve heavy ads, or quietly degrade output quality.
- Merging multiple files into one document is a common need but is usually locked behind expensive enterprise tools.
- Mobile users are underserved — most competing tools break or feel cramped on smaller screens.

### 1.3 Goals & Objectives

- Deliver a clean, fast, mobile-responsive SaaS conversion tool.
- Offer a generous free tier (2 files per session, every conversion type) to drive adoption.
- Monetise through a premium file-merge feature and higher per-session file limits.
- Build on a zero-cost infrastructure stack until the product earns its first revenue.
- Ship with security and CI/CD practices appropriate for a SaaS product handling user files.

### 1.4 Target Users

- **Students** — converting assignments and scanned notes between PDF, Word, and PowerPoint ahead of submission deadlines.
- **Freelancers** — reformatting client deliverables (proposals, invoices, decks) across formats quickly, often on the move.
- **Small businesses / teams** — merging multiple PDFs or Word documents into a single file for contracts, reports, or onboarding packets.

### 1.5 Success Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|-----------------|-----------------|
| Monthly Active Users | 500 | 2,000 |
| Free-to-Paid Conversion Rate | 3% | 6% |
| Paying Subscribers | 15 | 120 |
| Monthly Revenue (INR) | 1,335 | 10,680 |
| Conversion Success Rate | >95% | >98% |
| Average Page Load Time | <2s | <1.5s |

---

## 2. Scope & Constraints

### 2.1 In Scope (MVP)

- All 9 conversion types listed in Section 3.1.
- File upload with real-time progress bar and status feedback.
- Secure download of converted files.
- File merge feature, gated behind Pro / Business plans.
- User authentication for both free and paid users.
- Pricing page with Razorpay payment integration.
- Help & Support page with a feedback form.
- CI/CD pipeline and security hardening (detailed in the TRD).

### 2.2 Out of Scope (MVP)

- Native mobile apps (iOS / Android) — the web app is fully mobile-responsive instead.
- Google Drive / Dropbox import-export integration (Phase 2).
- Public API access for developers (Phase 2, Business plan).
- Dark mode (Phase 2).
- Conversion history dashboard (Phase 2).

### 2.3 Constraints

- Solo developer — delivery is sequenced across six phases (see Section 7).
- Zero-cost infrastructure at launch; every service runs on its free tier.
- Vercel's free-tier function timeout is 10 seconds, so large or complex PDF jobs are routed through the CloudConvert API (25 free conversions/day) instead of processing inline.

---

## 3. Feature Specifications

### 3.1 Conversion Catalogue

Every conversion type follows the same user flow: Upload → Validate → Convert → Preview → Download. All 9 conversion types are available on every plan; the free plan is limited to 2 files per session (see Section 5 for plan limits).

| Conversion | Free Limit | How It Works | Key Constraint |
|-----------|-----------|-------------|-----------------|
| PDF → Word (.docx) | 2 files | OCR for scanned PDFs; native parsing for text PDFs via Gotenberg/LibreOffice | Large files routed to CloudConvert |
| PDF → PowerPoint (.pptx) | 2 files | Detected page regions mapped to slide content boxes | Layout accuracy varies on complex PDFs |
| PDF → JPG | 2 files | Each page rasterised at 150–300 DPI; multipage output delivered as a ZIP | DPI/quality selector available |
| JPG → PDF | 2 files | Images wrapped with A4 page metadata; multiple images produce a multi-page PDF | — |
| JPG → PPT | 2 files | One slide created per image, auto-layout with centre alignment | — |
| Excel → CSV | 2 files | Strips formatting, exports the active sheet, comma-delimited UTF-8 output | — |
| CSV → Excel | 2 files | Parses delimiters, infers column types, applies basic table formatting | — |
| Word → PDF | 2 files | Headless rendering via the Gotenberg/LibreOffice stack | — |
| Word → PPT | 2 files | H1 maps to slide title, H2 to subtitle, body paragraphs become bullet points | — |

### 3.2 Upload & Conversion UX Flow

| Step | User Action | System Behaviour |
|-----|------------|-----------------|
| 1. Upload | Drag-and-drop or click to browse | File type and size validated via MIME type and magic bytes; clear error shown for invalid files |
| 2. Progress | Wait | Upload progress bar shown in real time (percentage + file name) |
| 3. Convert | Click Convert | Job is queued; real-time percentage progress streamed via SSE or polling |
| 4. Preview | Auto-shown | Thumbnail of the first page or sheet displayed before download |
| 5. Download | Click Download | File served securely; auto-deleted from storage after 1 hour |

### 3.3 File Merge Feature

Merge lets users combine multiple files of the same type (PDF, Word, or PPT) into one output. Files merge in upload order by default, and drag-to-reorder is available before merging. The upgrade prompt shown to free users on the merge page is inline (not a redirect), with one-tap payment and immediate feature unlock.

| Tier | Files per Merge | Sessions per Day | Price |
|-----|-----------------|-----------------|-------|
| Free | Blocked — inline upgrade prompt shown | — | ₹0 |
| Pro | Up to 10 files | Up to 10 sessions | ₹89/month |
| Business | Unlimited | Unlimited | ₹150/month |

### 3.4 Future Features (Phase 2+)

**High Value — Easy to Add**
- Compress PDF — reduce file size before or after conversion.
- PDF Page Extractor — pull specific page ranges from a multi-page PDF.
- Image to Text (OCR) — extract text from a photo or scanned image.
- Password-protect PDF — add or remove a PDF password.
- Watermark PDF — overlay a text or image watermark on every page.

**Growth Features**
- Conversion history dashboard for logged-in users.
- Shareable download links to send converted files to others.
- Google Drive and Dropbox integration for import and export.
- API access on the Business plan for developer automation.
- Bulk ZIP download after a batch conversion.

**Trust & Retention Features**
- File preview before download (thumbnail of the first page) — already in MVP scope.
- Quality selector for PDF to JPG (screen / print / high-res) — already in MVP scope.
- Dark mode toggle.
- Conversion-progress email notification for large files.

---

## 4. Website Structure & UX

### 4.1 Navigation

- Sticky top bar: logo top-left; dropdown menus for PDF, Image, Spreadsheet, and Word tools; a direct Merge link; Help; Login/Sign Up.
- A Help icon is always visible in the top-left corner of every page.
- The footer mirrors every navigation link individually for SEO and accessibility.
- Every conversion type and the merge feature are reachable from both the header dropdowns and the footer links.

### 4.2 Design System

- **Colour palette:** simple and clean; no dark backgrounds; no heavy animations or motion effects.
- **Responsive:** the same layout structure is used on desktop and mobile — not a stripped-down mobile view.
- **Mobile-interactive:** all buttons, dropdowns, and upload areas are touch-friendly (minimum 44px tap targets).
- **Font:** a system-safe sans-serif (Inter or system-ui).
- **No dark mode** at launch (Phase 2 addition).

### 4.3 Help & Support Page

- Accessible from the top-left Help icon on every page.
- Feedback form with Name, Email, Message, and Category (Bug / Feature Request / Billing / Other).
- Contact email displayed.
- FAQ section covering common conversion questions.
- Stated response SLA (e.g. reply within 48 hours).

---

## 5. Pricing & Plans

| Feature | Free | Pro (₹89/mo) | Business (₹150/mo) |
|---------|------|-------------|--------------------|
| All 9 conversion types | Yes | Yes | Yes |
| Files per conversion session | 2 | 10 | Unlimited |
| File merge (PDF, Word, PPT) | No | Yes | Yes |
| Merge sessions per day | — | 10 | Unlimited |
| Files per merge session | — | 10 | Unlimited |
| File preview before download | Yes | Yes | Yes |
| Priority processing queue | No | Yes | Yes |
| API access | No | No | Yes (Phase 2) |
| Cloud storage integration | No | No | Yes (Phase 2) |

**Payment gateway:** Razorpay (free to integrate; charges apply per transaction only). Billing is monthly and auto-renewing. On cancellation, the account instantly downgrades to the free tier at the end of the current billing period.

---

## 6. Security & Trust Requirements

FileConvert handles user-uploaded documents, so it must launch with no known vulnerabilities and with security testing built into every release. The product-level requirements below are implemented and verified in detail in the companion Technical Requirements Document (TRD), Section 8 (Security Architecture) and Section 11 (CI/CD & Testing Strategy).

- HTTPS enforced on every route, with HSTS headers set.
- Uploaded files are stored in isolated Cloudflare R2 buckets and auto-deleted on a 1-hour TTL.
- Every upload is checked against both MIME type and magic bytes — not just the file extension — and filenames are sanitised to prevent path traversal.
- Maximum file size is enforced server-side, not only in the browser.
- Rate limiting is applied per IP address on upload and conversion endpoints.
- CSRF tokens protect all state-changing requests, and Content Security Policy headers block inline scripts and external injection.
- Dependency vulnerabilities are scanned continuously (Dependabot / Snyk).
- No file contents are ever logged — only metadata such as size, type, and timestamp.
- Data handling is GDPR-aligned; no personal data is stored for free, unauthenticated usage.
- Every release passes through a CI/CD pipeline covering linting, unit tests, static analysis (SAST), dependency scanning, container scanning, integration tests, and a weekly dynamic scan (DAST) before reaching production.

---

## 7. Release Roadmap Summary

Total estimated effort is 70 working days at 4–6 hours/day (roughly 12–14 calendar weeks) for a solo developer. The full day-by-day build plan, including every technical task and its testing checkpoint, is maintained in the TRD, Section 12 (Implementation Plan).

| Phase | Focus | Days | End Milestone |
|-------|-------|------|---------------|
| 1 | UI Shell | 1–15 | Full UI live on a Vercel preview URL |
| 2 | Authentication | 16–22 | Sign-up, login, and plan-tier enforcement working |
| 3 | Conversion Engine | 23–42 | All 9 conversion types live |
| 4 | Payments & Merge | 43–52 | Paying users unlock merge; Razorpay live |
| 5 | Security & CI/CD | 53–62 | Pipeline running; OWASP ZAP scan passes |
| 6 | Polish & Launch | 63–70 | v1.0 live on the production domain |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PDF-to-PPT layout quality is inconsistent | High | Medium | Set expectations in the UI ('layout may vary'); allow manual re-ordering of slides |
| Vercel's 10s function timeout affects large PDFs | Medium | High | Route heavy jobs to CloudConvert; consider an early Railway upgrade |
| CloudConvert's 25/day free limit is exceeded | Medium | Medium | Queue overflow requests, notify the user of delay, upgrade to a paid tier from first revenue |
| Razorpay merchant KYC delays go-live | Medium | High | Start Razorpay merchant registration in Phase 4, before it is needed; KYC can take 3–5 business days |
| Gotenberg's Railway free tier hits its hour limit | Low | Medium | Monitor usage; upgrade to Railway's paid tier when approaching the limit |
| A security vulnerability surfaces in file parsing | Low | High | Strict MIME + magic bytes validation, isolated container execution, and aggressive auto-delete of stored files |

---

## 9. Appendix — Glossary (PRD)

| Term | Meaning |
|------|---------|
| **Gotenberg** | A Docker-based, LibreOffice-backed HTTP API used to convert PDF, Word, and PPT files headlessly. |
| **CloudConvert** | A third-party conversion API used as a fallback for heavy jobs that would exceed Vercel's function timeout. |
| **RLS** | Row-Level Security — a PostgreSQL/Supabase feature that restricts each user's database access to their own rows. |
| **SSE** | Server-Sent Events — a one-way stream used to push real-time conversion progress to the browser. |
| **TTL** | Time To Live — here, the 1-hour window after which an uploaded or converted file is auto-deleted from storage. |
| **DPI** | Dots Per Inch — the resolution used when rasterising PDF pages to JPG. |
| **CSP** | Content Security Policy — a response header that restricts which scripts and resources a page may load. |
| **HSTS** | HTTP Strict Transport Security — a header that forces browsers to use HTTPS for all future requests. |
| **Magic bytes** | The first few bytes of a file that identify its true type, used to verify uploads regardless of file extension. |
| **Razorpay** | The payment gateway used for Pro/Business subscriptions, supporting Indian payment methods. |

---

---

# Part 2: Technical Requirements Document (TRD) v1.0

---

# TECHNICAL REQUIREMENTS DOCUMENT (TRD)
# FileConvert
## File Conversion SaaS Platform — Engineering Specification

**Version:** 1.0  
**Date:** June 2026  
**Status:** Final — Ready for Development  
**Author:** Solo Developer / Engineering Owner  
**Stack:** Next.js 14 · Node.js · Gotenberg · Supabase · Cloudflare R2 · Upstash Redis  
**Companion Doc:** See FileConvert — Product Requirements Document (PRD) v1.1

---

## Table of Contents (TRD)

1. Purpose & Audience
2. System Architecture
3. Technology Stack
4. Data Model
5. API Specification
6. Conversion Engine — Implementation Notes
7. Security Architecture
8. Authentication & Session Management
9. Payments & Subscription Lifecycle
10. CI/CD Pipeline
11. Testing Strategy
12. Implementation Plan — Phase & Day-Wise
13. Non-Functional Requirements
14. Monitoring & Observability
15. Infrastructure & Cost Plan
16. Appendix — Environment Variables

---

## 1. Purpose & Audience

This Technical Requirements Document (TRD) translates the FileConvert PRD into an implementable engineering specification: system architecture, data model, API contracts, security controls, CI/CD pipeline, and the day-by-day build plan. It is written for the solo developer building the product and for any future contributor or contractor who needs to understand how the system fits together without re-deriving decisions from the PRD.

Where the PRD defines what the product must do and why, this TRD defines how it is built, run, and kept secure.

---

## 2. System Architecture

### 2.1 Architecture Overview

FileConvert is a single Next.js 14 (App Router) application that serves both the frontend UI and the backend API routes from one repository — the right shape for a solo developer to ship and operate. Heavy document conversion is delegated to a self-hosted Gotenberg service (LibreOffice under the hood) running on Railway, with the CloudConvert API as a fallback for jobs that risk exceeding Vercel's 10-second serverless function timeout. Authentication, the relational database, and row-level authorization are provided by Supabase. Files live in Cloudflare R2 with a 1-hour auto-delete lifecycle rule. Conversion and merge jobs run asynchronously through a BullMQ queue backed by Upstash Redis, with progress pushed to the browser over Server-Sent Events (SSE). Razorpay handles subscription billing, and Cloudflare sits in front of everything as CDN and DDoS protection.

### 2.2 Core Components

| Component | Responsibility |
|-----------|-----------------|
| **Next.js App Router (Vercel)** | Renders the UI and exposes REST/SSE API routes; orchestrates uploads, job creation, and plan-tier enforcement |
| **Gotenberg (Railway, Docker)** | Headless LibreOffice-backed HTTP API for PDF ↔ Word ↔ PPT conversions and merges |
| **CloudConvert API (fallback)** | Handles PDF→Word and PDF→PPT jobs that risk the Vercel 10s timeout; capped at 25 free conversions/day |
| **SheetJS / pdf-lib (in-process)** | Lightweight, fast jobs handled directly inside API routes: Excel↔CSV and simple PDF page operations |
| **BullMQ + Upstash Redis** | Async job queue for conversions and merges; also backs the daily merge-session counters |
| **Supabase (Postgres + Auth)** | User accounts, OAuth (Google), subscriptions, job metadata, Row-Level Security |
| **Cloudflare R2** | Object storage for uploaded and converted files; 1-hour TTL lifecycle rule auto-deletes everything |
| **Razorpay** | Subscription checkout, signature verification, and billing webhooks for Pro/Business plans |
| **Sentry + Vercel Analytics** | Error tracking and performance monitoring from day one |
| **Cloudflare (CDN/DNS)** | Proxies all traffic, terminates DNS, provides automatic DDoS mitigation |

### 2.3 Request Flow — Conversion Job

1. Browser uploads the file directly to a signed Cloudflare R2 URL issued by a Next.js API route (the file never passes through the Vercel function body, avoiding the 10s timeout on the upload itself).
2. The API route validates MIME type and magic bytes, checks the user's plan-tier filecount limit, and writes a conversion_jobs row with status queued.
3. A BullMQ job is enqueued; a worker process picks it up and routes it to Gotenberg, CloudConvert, or an in-process library depending on conversion type and estimated complexity.
4. The worker streams percentage progress back through Redis pub/sub, which the API exposes to the browser via an SSE endpoint.
5. On completion, the worker writes the output to R2, generates a first-page/sheet preview thumbnail, and marks the job completed.
6. The browser requests a short-lived signed download URL; the file (input and output) is deleted from R2 by the 1-hour TTL lifecycle rule regardless of whether it was downloaded.

---

## 3. Technology Stack

| Layer | Technology | Why / Notes |
|-------|-----------|-----------|
| **Frontend + API** | Next.js 14 (App Router) | One repo for UI and API routes — ideal for a solo developer |
| **Conversion engine** | Gotenberg (Docker) | LibreOffice wrapper; handles PDF, Word, and PPT conversions via HTTP API; saves an estimated 10–12 dev-days versus a custom renderer |
| **Lightweight conversions** | SheetJS, pdf-lib (JS) | Excel/CSV and simple PDF tasks handled client-side or directly in API routes |
| **Heavy conversion fallback** | CloudConvert API (free tier) | 25 free conversions/day; used for PDF-to-Word and PDF-to-PPT jobs when the Vercel timeout is a risk |
| **Database & auth** | Supabase (free tier) | PostgreSQL + Row-Level Security + built-in auth with Google OAuth |
| **File storage** | Cloudflare R2 (free tier) | Zero egress fees; 10GB free storage; 1-hour TTL auto-delete via lifecycle rules |
| **Job queue** | BullMQ + Redis (Upstash free) | Async conversion/merge jobs; real-time progress via SSE |
| **Hosting** | Vercel (free tier) | Next.js deployment; upgrade to Pro ($20/mo) after the first 10 paying users |
| **Gotenberg host** | Railway (free trial) | Docker container hosting; upgrade to paid ($5/mo) after first revenue |
| **Payments** | Razorpay | Free to integrate; per-transaction fee only; supports Indian payment methods |
| **Monitoring** | Vercel Analytics + Sentry (free) | Error tracking and performance monitoring from day one |
| **CDN + DDoS** | Cloudflare (free) | Proxies all traffic; automatic DDoS mitigation |

---

## 4. Data Model

All tables live in Supabase Postgres with Row-Level Security enabled so a user can only read or write their own rows.

### 4.1 users

| Field | Type | Notes |
|-------|------|-------|
| id | uuid, PK | Matches Supabase Auth user id |
| email | text, unique | — |
| auth_provider | text | 'email' \| 'google' |
| plan | text | 'free' \| 'pro' \| 'business', default 'free' |
| razorpay_customer_id | text, nullable | Set on first checkout |
| created_at | timestamptz | Default now() |

### 4.2 subscriptions

| Field | Type | Notes |
|-------|------|-------|
| id | uuid, PK | — |
| user_id | uuid, FK → users.id | — |
| plan | text | 'pro' \| 'business' |
| status | text | 'active' \| 'past_due' \| 'cancelled' |
| razorpay_subscription_id | text | — |
| current_period_end | timestamptz | Drives downgrade-at-period-end logic |
| created_at | timestamptz | Default now() |

### 4.3 conversion_jobs

| Field | Type | Notes |
|-------|------|-------|
| id | uuid, PK | — |
| user_id | uuid, FK → users.id | Authentication is required for free and paid usage alike |
| source_type / target_type | text | e.g. 'pdf' / 'docx' |
| status | text | 'queued' \| 'processing' \| 'completed' \| 'failed' |
| engine_used | text | 'gotenberg' \| 'cloudconvert' \| 'sheetjs' \| 'pdf-lib' |
| file_count | int | Validated server-side against the plan-tier limit |
| r2_input_key / r2_output_key | text | Object keys in the R2 bucket |
| error_message | text, nullable | Populated on failure |
| created_at / completed_at | timestamptz | — |

### 4.4 merge_sessions

| Field | Type | Notes |
|-------|------|-------|
| id | uuid, PK | — |
| user_id | uuid, FK → users.id | — |
| file_type | text | 'pdf' \| 'word' \| 'ppt' |
| file_count | int | Enforced against plan tier (10 for Pro, unlimited for Business) |
| status | text | 'queued' \| 'processing' \| 'completed' \| 'failed' |
| r2_output_key | text | — |
| created_at | timestamptz | Used together with Redis counters for the daily session cap |

### 4.5 usage_counters

Real-time enforcement of daily limits (e.g. Pro's 10 merge sessions/day) happens against an Upstash Redis counter keyed by user id and UTC date, with a 24-hour expiry. This table is the durable mirror used for billing audits and analytics, written asynchronously after each job.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid, PK | — |
| user_id | uuid, FK → users.id | — |
| counter_type | text | 'merge_session' \| 'conversion' |
| count | int | — |
| window_date | date | UTC calendar day the counter applies to |

### 4.6 feedback

| Field | Type | Notes |
|-------|------|-------|
| id | uuid, PK | — |
| name / email / message | text | From the Help page feedback form |
| category | text | 'bug' \| 'feature' \| 'billing' \| 'other' |
| status | text | 'open' \| 'resolved' |
| created_at | timestamptz | — |

---

## 5. API Specification

All routes are Next.js API routes under /api. Every state-changing route requires a valid session except /api/feedback, which is rate-limited instead.

### 5.1 Authentication

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/auth/signup | Public | Email/password account creation via Supabase Auth |
| POST /api/auth/login | Public | Email/password sign-in |
| GET /api/auth/callback/google | Public | Google OAuth callback (NextAuth + Supabase adapter) |
| GET /api/auth/session | Session | Returns the current user, plan, and session expiry |
| POST /api/auth/logout | Session | Invalidates the current session |

### 5.2 Conversion

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/convert/upload | Session | Issues a signed R2 upload URL after MIME + magic-byte pre-checks |
| POST /api/convert/jobs | Session | Creates a conversion job; enforces the plan's per-session file-count limit server-side (HTTP 403 with upgrade prompt if exceeded) |
| GET /api/convert/jobs/:jobId | Session | Polls job status as a fallback when SSE is unavailable |
| GET /api/convert/jobs/:jobId/stream | Session | SSE stream of percentage progress |
| GET /api/convert/jobs/:jobId/preview | Session | Returns the first-page/sheet preview thumbnail |
| GET /api/convert/jobs/:jobId/download | Session | Issues a short-lived signed download URL |

### 5.3 Merge

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/merge/sessions | Session | Creates a merge session; blocks Free, caps Pro at 10 files/10 sessions per day via the Redis counter, allows Business unrestricted |
| GET /api/merge/sessions/:id | Session | Status poll for a merge session |
| GET /api/merge/sessions/:id/stream | Session | SSE progress stream |
| GET /api/merge/sessions/:id/download | Session | Signed download URL for the merged output |

### 5.4 Payments

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/payments/createorder | Session | Creates a Razorpay order for the selected plan |
| POST /api/payments/verify | Session | Verifies the Razorpay payment signature server-side and activates the plan |
| POST /api/payments/webhook | Razorpay signature | Receives subscription.charged / subscription.halted / subscription.cancelled events |

### 5.5 Support

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/feedback | Public, rate-limited | Accepts Help page feedback form submissions |

---

## 6. Conversion Engine — Implementation Notes

| Conversion | Primary Engine | Fallback / Notes |
|-----------|-----------------|------------------|
| **PDF → Word** | Gotenberg (LibreOffice) | Scanned PDFs route through an OCR pre-pass; large/complex files fall back to CloudConvert to stay under the 10s Vercel timeout |
| **PDF → PPT** | Gotenberg | Page regions are detected and mapped to slide content boxes; complex layouts may need CloudConvert fallback |
| **PDF → JPG** | pdf-lib / poppler rasteriser | Each page rasterised at a user-selected DPI (150–300); multi-page output zipped before download |
| **JPG → PDF** | pdf-lib | Images wrapped with A4 page metadata; multiple images become a multi-page PDF |
| **JPG → PPT** | Gotenberg / pptx generator | One slide per image, auto-layout with centre alignment |
| **Excel → CSV** | SheetJS (in-process) | Strips formatting, exports the active sheet, comma-delimited UTF-8 |
| **CSV → Excel** | SheetJS (in-process) | Parses delimiters, infers column types, applies basic table formatting |
| **Word → PDF** | Gotenberg | Headless LibreOffice rendering |
| **Word → PPT** | Gotenberg + custom mapper | H1 → slide title, H2 → subtitle, body paragraphs → bullet points |
| **Merge (PDF)** | Gotenberg / pdf-lib | Concatenates pages in upload (or reordered) sequence |
| **Merge (Word)** | python-docx or LibreOffice | Sequentially appends document bodies, preserving section breaks |
| **Merge (PPT)** | python-pptx | Appends slides from each source deck in order |

Every job carries a server-side timeout budget. If a job is still running when 8 seconds remain on the Vercel function's 10-second ceiling, the orchestrator hands it off to CloudConvert rather than letting it fail, and the user sees the progress indicator continue uninterrupted.

---

## 7. Security Architecture

### 7.1 Transport & Storage

- HTTPS is enforced on every route; HSTS headers are set with a long max-age and includeSubDomains.
- Uploaded and converted files live in isolated Cloudflare R2 buckets, never on the application server's filesystem.
- An R2 lifecycle rule auto-deletes every object 1 hour after upload or download, whichever is later.
- No file contents are ever written to logs — only metadata (size, type, timestamp, job id).

### 7.2 Input Validation

- Every upload is checked against both its declared MIME type and its magic bytes (file signature) — a renamed .exe must fail even if labelled .pdf.
- Maximum file size is enforced server-side in the upload API route, not only via the client-side dropzone.
- Filenames are sanitised before use in any storage key or path to prevent path traversal.

### 7.3 Application Security

- Rate limiting (Upstash Ratelimit, sliding window) is applied per IP address on the upload and job-creation endpoints.
- CSRF tokens protect all state-changing requests.
- A Content Security Policy header blocks inline scripts and external script injection; XFrame-Options, X-Content-Type-Options, and Referrer-Policy headers are set on every response.
- Dependency vulnerabilities are scanned continuously via Dependabot and/or Snyk.
- Secrets (API keys, service-role keys, webhook secrets) are stored as Vercel/Railway environment variables, never committed to the repository.
- Data handling is GDPR-aligned: no personal data is retained for unauthenticated or free-tier usage beyond what's needed to enforce limits.

### 7.4 Authorization Model

- Supabase Row-Level Security policies scope every table so a user can only read or write rows where user_id matches their own auth id.
- Plan-tier limits (file counts, merge access, daily session caps) are enforced server-side in the API route handler, never trusted from client input.
- The Razorpay webhook handler verifies the request signature before processing any subscription event.

---

## 8. Authentication & Session Management

NextAuth is configured with the Supabase adapter, supporting email/password and Google OAuth. Sessions are JWT-based and short-lived, with silent refresh on activity. A thin middleware layer reads the session on every API route under /api/convert, /api/merge, and /api/payments, attaches the resolved plan tier to the request context, and rejects unauthenticated requests with HTTP 401 before any business logic runs.

| Edge Case | Expected Behaviour |
|-----------|-------------------|
| Expired session | API returns 401; client redirects to login with a return-to URL |
| Invalid/tampered token | Rejected at the middleware layer; treated as unauthenticated |
| Concurrent logins (same account, multiple devices) | Allowed; each device holds its own session |
| Password reset | Standard Supabase Auth reset-link flow; existing sessions remain valid until expiry |

---

## 9. Payments & Subscription Lifecycle

### 9.1 Checkout Flow

1. Client calls POST /api/payments/create-order with the selected plan; the server creates a Razorpay order and returns the order id.
2. The Razorpay checkout modal opens inline on the current page (pricing card or merge paywall) — never a redirect.
3. On success, the client sends the payment id, order id, and signature to POST /api/payments/verify.
4. The server recomputes the HMAC signature server-side; only on a match does it update the user's plan in Supabase and create a subscriptions row.
5. The UI reflects the new plan badge and unlocks merge access within seconds, without a full page reload.

### 9.2 Webhook Events

| Event | Handling |
|-------|----------|
| subscription.charged | Extends current_period_end; ensures plan remains active |
| subscription.halted | Marks subscription status 'past_due'; user keeps access until current_period_end, then downgrades |
| subscription.cancelled | Marks subscription 'cancelled'; plan downgrades to free at the end of the current billing period, per the PRD's cancellation policy |

---

## 10. CI/CD Pipeline

Every change flows through GitHub Actions before it can reach production. The pipeline is designed to fail closed: a red stage blocks merge or deploy.

| Stage | Tool / Method | Trigger |
|-------|---------------|---------|
| Lint + unit tests | ESLint, Jest | Every pull request |
| Static analysis (SAST) | Semgrep or CodeQL | Every pull request |
| Dependency scan | Dependabot / Snyk | Daily, automated |
| Container image scan | Trivy | On every Docker build (Gotenberg image) |
| Integration tests | Playwright against staging | Every merge to main |
| Dynamic analysis (DAST) | OWASP ZAP | Weekly, against staging |
| Penetration test checklist | Automated quarterly run | Quarterly, scheduled |
| Blue/green deploy | Vercel / Railway preview deploys | On release tag |
| Health check + autorollback | Error-rate spike detection | Post-deploy |

**Branch strategy:** feature branches merge to main only after CI passes; main auto-deploys to a staging environment; a tagged release promotes staging to production via a blue/green deploy, with automatic rollback if the post-deploy health check detects an error-rate spike.

---

## 11. Testing Strategy

| Layer | Tooling | Coverage Focus |
|-------|---------|-----------------|
| Unit | Jest | Conversion option mapping, plan-limit logic, signature verification helpers |
| Integration / E2E | Playwright | Upload → convert → download, login, payment, and merge user journeys |
| Static analysis | Semgrep / CodeQL | Injection, unsafe deserialization, and common JS/TS vulnerability patterns |
| Dynamic analysis | OWASP ZAP | Live scan of staging for XSS, injection, and misconfigured headers |
| Container scan | Trivy | CVEs in the Gotenberg Docker base image and dependencies |
| Manual penetration checklist | Quarterly manual pass | SQL injection, XSS, IDOR on download URLs, CSRF, broken auth, path traversal |

**Acceptance bar** before any release: ESLint and Jest pass with zero errors, Semgrep/CodeQL report no high-or-critical findings, Trivy reports no critical/high CVEs in the container image, and the OWASP ZAP scan reports no medium-or-higher alerts on staging.

---

## 12. Implementation Plan — Phase & Day-Wise

Total estimated effort is 70 working days at 4–6 hours/day (roughly 350 hours, or 12–14 calendar weeks) for a solo developer. Phases run sequentially; each ends with a testing checkpoint before the next begins.

### 12.1 Phase 1 — Project Setup & UI Shell (Days 1–15)

**Goal:** full UI built, navigation working, upload functional, no backend conversion yet — launchable as a 'coming soon' landing page.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 1–2 | Initialise the Next.js 14 project, GitHub repo, Vercel deployment, ESLint and Prettier config | Vercel preview URL live |
| 3–4 | Build the global layout: sticky header with dropdown nav (PDF, Image, Spreadsheet, Word, Merge, Help) and a footer mirroring all links | All nav links render; mobile touch works |
| 5–6 | Build the Home page: hero, feature grid, conversion-type cards, CTA to pricing | Pixel-accurate on desktop and mobile |
| 7–8 | Build the shared Upload component: drag-and-drop zone, file browser, MIME validation, size limit, upload progress bar | Upload accepts valid files, rejects invalid ones, shows progress |
| 9–10 | Build the 9 individual converter pages using the shared Upload component | Each page loads and uploads correctly; no conversion logic yet |
| 11–12 | Build the Merge page: multi-file upload, drag-to-reorder list, inline premium-gate UI | Merge UI renders; paywall shows for a free user |
| 13 | Build the Pricing page: Free/Pro/Business cards, comparison table, Razorpay button placeholders | Pricing page renders correctly |
| 14 | Build the Help & Support page: feedback form, FAQ accordion, contact info | Form renders; FAQ toggle works |
| 15 | Cross-browser and mobile testing of all pages (Chrome, Safari, Firefox; Android and iOS) | All pages pass visual QA |

### 12.2 Phase 2 — Authentication & Database (Days 16–22)

**Goal:** users can sign up and log in (email or Google), and their plan tier is stored and enforced.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 16–17 | Set up the Supabase project; create users and subscriptions tables with RLS policies | Tables created; RLS prevents cross-user data access |
| 18–19 | Integrate NextAuth with the Supabase adapter; add email/password and Google OAuth sign-in | Sign up, log in, log out work end-to-end |
| 20–21 | Add session-aware UI: avatar, plan badge, logout in the header; hide premium features for free users | Free user sees the paywall; logged-out user is prompted to sign in |
| 22 | Test auth edge cases: expired session, invalid token, concurrent login, password reset | All edge cases handled gracefully |

### 12.3 Phase 3 — Conversion Engine (Days 23–42)

**Goal:** all 9 conversion types live and working — the largest and most complex phase.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 23–24 | Stand up the Gotenberg Docker container on Railway; confirm its HTTP API is reachable from Next.js API routes | Gotenberg health endpoint returns 200 |
| 25–26 | Set up the Cloudflare R2 bucket; implement secure upload from Next.js to R2; configure the 1-hour TTL lifecycle rule | Files upload to R2; auto-delete after 1 hour confirmed |
| 27–28 | Set up BullMQ with Upstash Redis; create the conversion job queue; implement the SSE endpoint for progress | Jobs queue correctly; progress percentage streams to the browser |
| 29–30 | Implement PDF→Word (Gotenberg/LibreOffice) with a scanned-PDF OCR fallback to CloudConvert | Native and scanned PDFs both convert accurately |
| 31–32 | Implement PDF→PPT; validate slide layout output quality | Output slides are readable; layout is acceptable |
| 33 | Implement PDF→JPG (rasterise at 150–300 DPI; multi-page output zipped) | Single- and multi-page PDFs both produce correct JPG output |
| 34 | Implement JPG→PDF and JPG→PPT | Both conversions produce correct output |
| 35 | Implement Excel→CSV and CSV→Excel using SheetJS | Both conversions preserve data correctly |
| 36–37 | Implement Word→PDF and Word→PPT via Gotenberg | Heading hierarchy maps correctly to PPT slides |
| 38–39 | Enforce the free-tier 2-files-per-session limit server-side; return 403 with an upgrade prompt when exceeded | Free user is blocked at the 3rd file; Pro user succeeds |
| 40 | Implement file preview: first-page/sheet thumbnail generation for PDF/PPT/Word, shown before download | Thumbnail shown for every supported type |
| 41–42 | End-to-end testing of all 9 conversion types against valid, invalid, large, small, scanned, and corrupt files | All types pass with a >95% success rate on the test corpus |

### 12.4 Phase 4 — Payments & Premium Merge (Days 43–52)

**Goal:** the Razorpay payment flow is live, Pro/Business tiers unlock, and merge works end-to-end for paying users.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 43–44 | Integrate Razorpay: create the order server-side, open the checkout modal client-side, verify the payment signature server-side | Test payment completes; signature verification passes |
| 45 | On successful payment, update the user's plan in Supabase and unlock premium features immediately, without a page reload | User sees the Pro badge and merge access within 5 seconds of payment |
| 46 | Implement the subscription webhook: handle subscription.charged, subscription.halted, subscription.cancelled | Plan downgrades correctly on cancellation |
| 47–48 | Implement the merge backend: accept multi-file upload (up to 10 for Pro), merge PDFs via Gotenberg, Word via python-docx/LibreOffice, PPT via python-pptx | A 10-file merge produces a correct output for all three file types |
| 49 | Enforce merge session limits (10/day Pro, unlimited Business) via the Redis daily counter | Pro user is blocked on the 11th session; Business user is unrestricted |
| 50 | Build the inline upgrade prompt on the merge page for free users, with one-tap Razorpay upgrade | Free user can upgrade without leaving the merge page |
| 51–52 | End-to-end payment and merge testing: happy path, failed payment, expired card, downgrade, re-upgrade | All payment scenarios are handled correctly |

### 12.5 Phase 5 — Security Hardening & CI/CD (Days 53–62)

**Goal:** all security controls are in place, the CI/CD pipeline runs on every push, and the OWASP ZAP scan passes.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 53 | Add HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers to all responses | SecurityHeaders.com reports grade A |
| 54 | Implement IP-based rate limiting on upload/conversion endpoints with Upstash Ratelimit | Abuse requests are blocked; legitimate requests pass |
| 55 | Add magic-bytes validation to the upload handler and sanitise filenames | A renamed .exe is rejected; a valid PDF is accepted |
| 56 | Set up the GitHub Actions CI pipeline: lint, Jest, Semgrep SAST, Dependabot on every PR | Pipeline runs and passes on a sample PR |
| 57 | Set up the Playwright integration suite covering upload, convert, download, login, and payment flows | All critical user journeys pass in CI |
| 58 | Set up Trivy container scanning on the Gotenberg Docker build | No critical or high CVEs in the image |
| 59 | Run the OWASP ZAP DAST scan against staging; fix any medium-or-higher findings | ZAP reports no medium+ alerts |
| 60 | Configure Sentry error tracking, Vercel Analytics, and an uptime monitoring alert | Errors appear in Sentry; the analytics dashboard is populated |
| 61–62 | Run the penetration test checklist: SQL injection, XSS, IDOR on download URLs, CSRF, broken auth, path traversal | All checklist items pass or are mitigated |

### 12.6 Phase 6 — Polish, QA & Launch (Days 63–70)

**Goal:** production-ready v1.0 launched, tested across browsers and devices, ready for first users.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 63–64 | Full cross-browser QA (Chrome, Firefox, Safari; desktop + mobile); fix visual/functional regressions | All pages pass on all browsers |
| 65 | SEO: meta titles, descriptions, Open Graph tags, robots.txt, sitemap.xml | Google Search Console reports no errors |
| 66 | Performance audit with Lighthouse; optimise images, lazy-load off-screen content, confirm Core Web Vitals | Lighthouse score >85 on mobile |
| 67 | Write user-facing documentation: FAQ and how-to guides for each conversion type on the Help page | Help page content is complete and accurate |
| 68 | Set up the custom domain; configure Cloudflare DNS/proxy and DDoS protection | Site loads on the custom domain; Cloudflare is active |
| 69 | Soft launch to 5–10 beta users; collect feedback via the Help form | At least 3 conversions completed by beta users |
| 70 | Address critical beta feedback; tag the v1.0 release; full deploy to production | v1.0 is live; no P0 bugs open |

### 12.7 Phase Summary

| Phase | Focus | Days | End Milestone |
|-------|-------|------|---------------|
| 1 | UI Shell | 1–15 | Full UI live on a Vercel preview URL |
| 2 | Authentication | 16–22 | Sign-up, login, plan-tier enforcement working |
| 3 | Conversion Engine | 23–42 | All 9 conversion types live |
| 4 | Payments & Merge | 43–52 | Paying users unlock merge; Razorpay live |
| 5 | Security & CI/CD | 53–62 | Pipeline running; OWASP ZAP scan passes |
| 6 | Polish & Launch | 63–70 | v1.0 live on the production domain |

---

## 13. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Average page load <2s at launch, <1.5s by Month 6; conversion success rate >95% at launch, >98% by Month 6 |
| **Scalability** | Async, queue-based job processing decouples upload spikes from conversion throughput; no architecture change needed before roughly 10,000 jobs/day |
| **Availability** | Best-effort uptime on free-tier infrastructure at launch; Vercel/Railway paid upgrades are the first lever once revenue starts (see Section 14) |
| **Reliability** | Failed jobs are retried once automatically; persistent failures surface a clear error to the user rather than a silent hang |
| **Data retention** | Uploaded and converted files are never retained beyond the 1-hour TTL; only job metadata persists |
| **Accessibility** | Touch targets ≥44px on mobile; identical layout structure across breakpoints, not a reduced mobile experience |
| **Maintainability** | TypeScript throughout; conversion engines isolated behind a single adapter interface so a new engine can be added without touching API route logic |

---

## 14. Monitoring & Observability

- Sentry captures unhandled exceptions and failed API routes, with alerts on new error types.
- Vercel Analytics tracks page load performance and Core Web Vitals in production.
- An uptime check pings the Gotenberg health endpoint and the main site on a short interval, alerting on downtime.
- The post-deploy health check watches error-rate for a window after each release and triggers an automatic rollback if it spikes (see Section 10).

---

## 15. Infrastructure & Cost Plan

All services run on free tiers at launch. The table below shows the upgrade trigger and cost for each.

| Service | Free Tier Limit | Upgrade Trigger | Paid Cost |
|---------|-----------------|-----------------|-----------|
| Vercel | 100GB bandwidth, 10s function timeout | 10+ paying users or timeout issues | $20/month |
| Railway | 500 hours/month (Gotenberg) | Approaching 500h or needing persistence | $5/month |
| Supabase | 500MB DB, 50,000 MAU | DB >500MB or MAU >50,000 | $25/month |
| Cloudflare R2 | 10GB storage, 10M reads | Storage >10GB | $0.015/GB |
| Upstash Redis | 10,000 commands/day | Queue jobs >10,000/day | $0.20/100K |
| CloudConvert | 25 conversions/day | Daily conversions >25 | Pay-per-use |
| Cloudflare CDN | Unlimited (free forever) | — | — |
| Razorpay | No monthly fee | — | 2% per transaction |
| Sentry | 5,000 errors/month | Errors >5,000/month | $26/month |

**Estimated monthly infrastructure cost at launch:** ₹0. The first paid upgrade is typically needed around 10 paying subscribers (≈₹890/month in revenue).

---

## 16. Appendix — Environment Variables

| Variable | Purpose |
|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Client-side Supabase connection |
| SUPABASE_ANON_KEY | Client-side Supabase connection |
| SUPABASE_SERVICE_ROLE_KEY | Server-side privileged Supabase access (job writes, admin actions) |
| NEXTAUTH_SECRET | Session token signing |
| GOOGLE_CLIENT_ID | Google OAuth |
| GOOGLE_CLIENT_SECRET | Google OAuth |
| R2_ACCOUNT_ID | Cloudflare R2 storage access |
| R2_ACCESS_KEY_ID | Cloudflare R2 storage access |
| R2_SECRET_ACCESS_KEY | Cloudflare R2 storage access |
| R2_BUCKET | Cloudflare R2 storage access |
| UPSTASH_REDIS_REST_URL | BullMQ queue and rate-limit/usage counters |
| UPSTASH_REDIS_REST_TOKEN | BullMQ queue and rate-limit/usage counters |
| GOTENBERG_URL | Internal URL of the Railway-hosted Gotenberg service |
| CLOUDCONVERT_API_KEY | Fallback conversion API |
| RAZORPAY_KEY_ID | Payment order creation and signature verification |
| RAZORPAY_KEY_SECRET | Payment order creation and signature verification |
| RAZORPAY_WEBHOOK_SECRET | Webhook authentication |
| SENTRY_DSN | Error tracking |

---

## End of Combined Documentation

**FileConvert TRD v1.0 + PRD v1.1 — Complete Reference**  
All content preserved for solo developer implementation and future contributor reference.
