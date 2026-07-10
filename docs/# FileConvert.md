# FileConvert — Complete Documentation v2.0

**Supersedes:** v1.1 (PRD) + v1.0 (TRD)
**Change driver:** Deployment moved from Vercel serverless to a self-managed cloud VM setup (AWS/GCP/Azure/DigitalOcean/Oracle student credits), which removes the 10-second serverless timeout and opens up a proper containerised, multi-worker architecture.

---

## What Changed in v2.0 — Summary

| Area | v1.1 / v1.0 | v2.0 |
|------|-------------|------|
| Hosting | Vercel (serverless functions) | Cloud VM(s) via student credits — Docker Compose |
| Timeout constraint | Hard 10s Vercel function limit drove architecture | Removed — workers run as long as a job needs |
| Conversion routing | Single worker decides engine; CloudConvert as timeout escape hatch | Dedicated **Orchestrator service** routes jobs to specialised workers; CloudConvert kept only as an emergency backup if Gotenberg is down |
| Workers | One BullMQ worker handling every conversion type | Separate **Document / Image / Video / Audio / OCR** workers, each with its own engine |
| Reverse proxy | None (Vercel handled this) | **Nginx** — TLS, compression, rate limiting, static asset serving |
| Security scanning | MIME + magic bytes only | Adds **ClamAV** malware scanning before any file is processed |
| ORM | Raw Supabase client queries | **Prisma** |
| Monitoring | Sentry + Vercel Analytics only | Adds **Prometheus + Grafana** (metrics dashboards) and **OpenTelemetry** (tracing) — post-MVP |
| Progress updates | SSE | SSE at MVP; **WebSockets** as a v2.0 feature for true bidirectional real-time progress |
| Product features | Fixed 9 conversions + merge | Adds AI-assisted conversion suggestions, resumable/chunked uploads, plugin-based engine, admin dashboard, usage analytics, audit logs |
| Infra cost model | Vercel + Railway free tiers | Student cloud credits across 2+ VMs; still effectively ₹0 until credits run out |

This document keeps everything from v1.1/v1.0 that is still true, and replaces the sections that were built specifically around Vercel's constraints.

---

## Table of Contents

**Part 1 — Product Requirements Document (PRD) v2.0**

1. Product Overview
2. Scope & Constraints
3. Feature Specifications
4. Website Structure & UX
5. Pricing & Plans
6. Security & Trust Requirements
7. Release Roadmap Summary
8. Risk Register
9. Appendix — Glossary

**Part 2 — Technical Requirements Document (TRD) v2.0**

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

**Part 3 — v2.0 Additions**
17. New Features (Full Specification)
18. Deployment Architecture — Cloud VM / Docker Compose
19. Supporting-Tool Reference (ORM, Tracing, PostHog, Flagsmith, Grafana, Nginx, ClamAV)
20. Build Timeline Estimate

---

# Part 1: PRODUCT REQUIREMENTS DOCUMENT (PRD) v2.0

## FileConvert — File Conversion SaaS Platform — Solo Developer Build

**Version:** 2.0
**Date:** July 2026
**Status:** Final — Ready for Development
**Author:** Product Owner / Solo Developer
**Tech Stack:** Next.js 14 | Node.js | Gotenberg | Cloudflare R2 | Supabase | Docker | Cloud VM (student credits)
**Pricing:** Free | Pro: ₹89/month | Business: ₹150/month
**Companion Doc:** See Part 2 — Technical Requirements Document (TRD) v2.0

---

## 1. Product Overview

### 1.1 Executive Summary

FileConvert is a web-based SaaS platform for converting, merging, and managing documents across PDF, Word, JPG, Excel, CSV, and PowerPoint formats. It targets students, freelancers, and small businesses who need a fast, reliable, and secure conversion tool without installing expensive desktop software or fighting through ad-heavy free sites.

Deployment now runs on cloud virtual machines funded by student credits rather than Vercel's serverless platform. This removes the 10-second execution ceiling that shaped the original design and allows the product to grow into a genuinely production-grade, containerised system without a future re-architecture.

### 1.2 Problem Statement

- Users need quick, reliable file format conversions without installing software.
- Most free online converters are unreliable, serve heavy ads, or quietly degrade output quality.
- Merging multiple files into one document is a common need but is usually locked behind expensive enterprise tools.
- Mobile users are underserved — most competing tools break or feel cramped on smaller screens.
- Serverless-hosted converters (the original FileConvert plan included) tend to struggle with large files because of execution time limits — a self-managed cloud deployment removes that ceiling entirely.

### 1.3 Goals & Objectives

- Deliver a clean, fast, mobile-responsive SaaS conversion tool.
- Offer a generous free tier (2 files per session, every conversion type) to drive adoption.
- Monetise through a premium file-merge feature and higher per-session file limits.
- Build on student cloud credits until the product earns its first revenue, then transition to a paid VM tier.
- Ship with security and CI/CD practices appropriate for a SaaS product handling user files, including malware scanning on every upload.
- Design the conversion engine so new formats (video, audio, additional image types) can be added as new worker services without touching existing code.

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
| Average Conversion Time | <5s (documents) | <3s (documents) |

---

## 2. Scope & Constraints

### 2.1 In Scope (MVP)

- All 9 core conversion types listed in Section 3.1.
- File upload with real-time progress bar and status feedback.
- Secure download of converted files.
- File merge feature, gated behind Pro / Business plans.
- User authentication for both free and paid users.
- Pricing page with Razorpay payment integration.
- Help & Support page with a feedback form.
- Malware scanning (ClamAV) on every uploaded file before it reaches a conversion worker.
- CI/CD pipeline and security hardening (detailed in the TRD).

### 2.2 In Scope (v2.0 Fast-Follow — see Section 17 for full specs)

- Resumable and chunked uploads for large files.
- Real-time progress via WebSockets (replacing SSE as the primary channel).
- Intelligent file-type detection (content-based, not extension-based).
- Admin dashboard with live queue metrics.
- Usage analytics and audit logs.
- Background cleanup / lifecycle management for temporary files (formalising the existing 1-hour TTL into an observable job).

### 2.3 Out of Scope (still deferred)

- Native mobile apps (iOS / Android) — the web app is fully mobile-responsive instead.
- Google Drive / Dropbox import-export integration (Phase 2).
- Public API access for developers (Phase 2, Business plan).
- Dark mode (Phase 2).
- Video/audio conversion as a customer-facing feature (the worker architecture supports it, but it isn't offered to users until demand justifies FFmpeg infrastructure costs).
- Multi-region deployment and Kubernetes (explicitly deferred until traffic outgrows two VMs — see Section 18).

### 2.4 Constraints

- Solo developer — delivery is sequenced across phases (see Section 12 and Section 20).
- Infrastructure funded by student cloud credits at launch; every service is either open-source/self-hosted or on a managed free tier until credits run low.
- No serverless timeout to design around — jobs run for as long as they need inside worker containers, monitored by health checks and job-level retry logic instead.
- At least two VMs are used from the start: one for the web-facing stack (Next.js, Nginx, Redis), one for CPU-intensive work (Gotenberg and conversion workers), so a burst of conversions never makes the website itself feel slow.

---

## 3. Feature Specifications

### 3.1 Conversion Catalogue

Every conversion type follows the same user flow: Upload → Validate → Scan → Convert → Preview → Download. All 9 conversion types are available on every plan; the free plan is limited to 2 files per session (see Section 5 for plan limits).

| Conversion | Free Limit | How It Works | Key Constraint |
|-----------|-----------|-------------|-----------------|
| PDF → Word (.docx) | 2 files | OCR for scanned PDFs (Tesseract); native parsing for text PDFs via Gotenberg/LibreOffice | Routed through the Document Worker |
| PDF → PowerPoint (.pptx) | 2 files | Detected page regions mapped to slide content boxes | Layout accuracy varies on complex PDFs |
| PDF → JPG | 2 files | Each page rasterised at 150–300 DPI; multipage output delivered as a ZIP | DPI/quality selector available |
| JPG → PDF | 2 files | Images wrapped with A4 page metadata; multiple images produce a multi-page PDF | Routed through the Image Worker |
| JPG → PPT | 2 files | One slide created per image, auto-layout with centre alignment | — |
| Excel → CSV | 2 files | Strips formatting, exports the active sheet, comma-delimited UTF-8 output | — |
| CSV → Excel | 2 files | Parses delimiters, infers column types, applies basic table formatting | — |
| Word → PDF | 2 files | Headless rendering via the Gotenberg/LibreOffice stack | — |
| Word → PPT | 2 files | H1 maps to slide title, H2 to subtitle, body paragraphs become bullet points | — |

### 3.2 Upload & Conversion UX Flow

| Step | User Action | System Behaviour |
|-----|------------|-----------------|
| 1. Upload | Drag-and-drop or click to browse | File type and size validated via MIME type and magic bytes; clear error shown for invalid files. Large files upload in resumable chunks (see Section 17.4). |
| 2. Scan | Automatic | File is queued for a ClamAV scan before any worker touches it; infected files are rejected with a clear message |
| 3. Progress | Wait | Real-time progress pushed over WebSocket (percentage + file name + current stage) |
| 4. Convert | Click Convert | Job is queued via BullMQ; the Orchestrator routes it to the correct worker (Document / Image / OCR) |
| 5. Preview | Auto-shown | Thumbnail of the first page or sheet displayed before download |
| 6. Download | Click Download | File served securely; auto-deleted from storage after 1 hour by the lifecycle cleanup job |

### 3.3 File Merge Feature

Merge lets users combine multiple files of the same type (PDF, Word, or PPT) into one output. Files merge in upload order by default, and drag-to-reorder is available before merging. The upgrade prompt shown to free users on the merge page is inline (not a redirect), with one-tap payment and immediate feature unlock.

| Tier | Files per Merge | Sessions per Day | Price |
|-----|-----------------|-----------------|-------|
| Free | Blocked — inline upgrade prompt shown | — | ₹0 |
| Pro | Up to 10 files | Up to 10 sessions | ₹89/month |
| Business | Unlimited | Unlimited | ₹150/month |

### 3.4 Future Features (Phase 2+, unchanged from v1.1)

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

### 3.5 New in v2.0 — Product-Level Features

See Section 17 for full technical specification of each. Summary for product scope:

| Feature | Plan Availability | Purpose |
|---------|-------------------|---------|
| AI-powered conversion recommendations | All plans | Suggests the best output format/settings based on the uploaded file |
| Intelligent file-type detection | All plans | Detects true file type from content, not just extension, before routing |
| Malware scanning | All plans | ClamAV scan on every upload, mandatory before conversion |
| Resumable & chunked uploads | All plans | Large files upload reliably even on unstable connections |
| Real-time WebSocket progress | All plans | Replaces polling/SSE with a persistent bidirectional connection |
| Plugin-based conversion engine | Internal / dev-facing | New conversion types added as isolated worker plugins |
| Admin dashboard | Internal (solo developer) | Live queue length, failed jobs, CPU/RAM, conversion volume |
| Usage analytics | Internal, informs product decisions | Which conversions are most used, drop-off points |
| Audit logs | Business plan / internal | Full trail of account and billing-relevant actions |
| Background cleanup service | All plans, invisible to user | Formal, monitored job enforcing the 1-hour file TTL |

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
| Malware scanning | Yes | Yes | Yes |
| Audit log access | No | No | Yes |
| API access | No | No | Yes (Phase 2) |
| Cloud storage integration | No | No | Yes (Phase 2) |

**Payment gateway:** Razorpay (free to integrate; charges apply per transaction only). Billing is monthly and auto-renewing. On cancellation, the account instantly downgrades to the free tier at the end of the current billing period.

---

## 6. Security & Trust Requirements

FileConvert handles user-uploaded documents, so it must launch with no known vulnerabilities and with security testing built into every release. The product-level requirements below are implemented and verified in detail in the companion TRD, Section 7 (Security Architecture) and Section 11 (CI/CD & Testing Strategy).

- HTTPS enforced on every route, terminated at Nginx, with HSTS headers set.
- Every uploaded file is scanned by ClamAV before it is queued for conversion; infected files are rejected and logged.
- Uploaded files are stored in isolated Cloudflare R2 buckets and auto-deleted on a 1-hour TTL, enforced by a monitored cleanup job.
- Every upload is checked against both MIME type and magic bytes — not just the file extension — and filenames are sanitised to prevent path traversal.
- Maximum file size is enforced server-side, not only in the browser.
- Rate limiting is applied at the Nginx layer and per IP address on upload and conversion endpoints.
- CSRF tokens protect all state-changing requests, and Content Security Policy headers block inline scripts and external injection.
- Dependency vulnerabilities are scanned continuously (Dependabot / Snyk), and the Gotenberg/worker container images are scanned with Trivy.
- No file contents are ever logged — only metadata such as size, type, and timestamp.
- Data handling is GDPR-aligned; no personal data is stored for free, unauthenticated usage.
- Every release passes through a CI/CD pipeline covering linting, unit tests, static analysis (SAST), dependency scanning, container scanning, integration tests, and a weekly dynamic scan (DAST) before reaching production.

---

## 7. Release Roadmap Summary

The full day-by-day build plan is maintained in the TRD, Section 12. High-level phase view:

| Phase | Focus | End Milestone |
|-------|-------|----------------|
| 1 | UI Shell | Full UI live on a staging VM URL |
| 2 | Authentication | Sign-up, login, and plan-tier enforcement working |
| 3 | Core Infra (Docker, Nginx, Redis, Orchestrator) | Containers running on both VMs; health checks green |
| 4 | Conversion Engine (Document + Image + OCR workers) | All 9 conversion types live |
| 5 | Payments & Merge | Paying users unlock merge; Razorpay live |
| 6 | Security, ClamAV & CI/CD | Pipeline running; ZAP scan passes; malware scanning live |
| 7 | Monitoring & Polish | Grafana dashboards live; v2.0 launched on production domain |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PDF-to-PPT layout quality is inconsistent | High | Medium | Set expectations in the UI ('layout may vary'); allow manual re-ordering of slides |
| Student cloud credits run out before revenue covers hosting | Medium | High | Track credit burn monthly; keep a fallback budget for one small paid VM tier ($5–10/month) |
| A single VM outage takes down both web and conversion traffic | Medium | High | Two-VM separation (web vs. workers) from day one; health checks and automatic container restart via Docker Compose |
| Gotenberg or a worker container crashes under load | Medium | Medium | Dead-letter queue and automatic job retry (see Section 17.7); Prometheus alert on worker container restarts |
| ClamAV false positives block legitimate files | Low | Medium | Manual review path via the admin dashboard; keep virus definitions updated automatically |
| Razorpay merchant KYC delays go-live | Medium | High | Start Razorpay merchant registration early, before it is needed; KYC can take 3–5 business days |
| A security vulnerability surfaces in file parsing | Low | High | Strict MIME + magic bytes validation, ClamAV scanning, isolated container execution, and aggressive auto-delete of stored files |

---

## 9. Appendix — Glossary (PRD)

| Term | Meaning |
|------|---------|
| **Gotenberg** | A Docker-based, LibreOffice-backed HTTP API used to convert PDF, Word, and PPT files headlessly. |
| **CloudConvert** | A third-party conversion API, now used only as an emergency backup if Gotenberg is unavailable (previously the primary Vercel-timeout fallback). |
| **Orchestrator** | A new service that decides which worker (Document, Image, Video, OCR) should handle a job, manages retries, and balances load if multiple Gotenberg instances exist. |
| **RLS** | Row-Level Security — a PostgreSQL/Supabase feature that restricts each user's database access to their own rows. |
| **SSE** | Server-Sent Events — a one-way stream used to push real-time conversion progress to the browser (MVP); replaced by WebSockets in v2.0. |
| **TTL** | Time To Live — here, the 1-hour window after which an uploaded or converted file is auto-deleted from storage. |
| **DPI** | Dots Per Inch — the resolution used when rasterising PDF pages to JPG. |
| **CSP** | Content Security Policy — a response header that restricts which scripts and resources a page may load. |
| **HSTS** | HTTP Strict Transport Security — a header that forces browsers to use HTTPS for all future requests. |
| **Magic bytes** | The first few bytes of a file that identify its true type, used to verify uploads regardless of file extension. |
| **Razorpay** | The payment gateway used for Pro/Business subscriptions, supporting Indian payment methods. |
| **ClamAV** | Open-source antivirus engine used to scan every uploaded file for malware before conversion. |
| **Nginx** | Reverse proxy sitting in front of the app, handling TLS, compression, rate limiting, and static file serving. |
| **Dead-letter queue** | A holding queue for jobs that failed repeatedly, so they can be inspected instead of silently disappearing. |

---
---

# Part 2: TECHNICAL REQUIREMENTS DOCUMENT (TRD) v2.0

## FileConvert — File Conversion SaaS Platform — Engineering Specification

**Version:** 2.0
**Date:** July 2026
**Status:** Final — Ready for Development
**Author:** Solo Developer / Engineering Owner
**Stack:** Next.js 14 · Node.js · Prisma · Gotenberg · Supabase (Postgres) · Cloudflare R2 · Redis · BullMQ · Docker · Nginx
**Companion Doc:** See Part 1 — Product Requirements Document (PRD) v2.0

---

## 1. Purpose & Audience

This Technical Requirements Document (TRD) translates the FileConvert PRD into an implementable engineering specification: system architecture, data model, API contracts, security controls, CI/CD pipeline, and the day-by-day build plan. It is written for the solo developer building the product and for any future contributor or contractor who needs to understand how the system fits together without re-deriving decisions from the PRD.

Where the PRD defines what the product must do and why, this TRD defines how it is built, run, and kept secure — updated for a cloud-VM deployment rather than Vercel serverless.

---

## 2. System Architecture

### 2.1 Architecture Overview

FileConvert v2.0 is deployed on cloud virtual machines (funded by student credits on AWS, GCP, Azure, DigitalOcean, or Oracle Cloud) rather than Vercel, using Docker Compose to run every service as a container. Removing the serverless timeout means conversion jobs are no longer designed around an 8-second safety margin — instead, an **Orchestrator service** routes each job to a dedicated worker type (Document, Image, OCR, and — when video/audio features ship — Video and Audio), each responsible for its own conversion engine.

Two virtual machines are used from day one:

- **VM 1 (web tier):** Next.js application, Nginx reverse proxy, Redis.
- **VM 2 (worker tier):** Orchestrator, BullMQ workers, Gotenberg, and (later) FFmpeg/Tesseract containers.

This separation means a burst of CPU-heavy conversions never makes the website itself feel slow. Authentication, the relational database, and row-level authorization are still provided by Supabase, now accessed through Prisma rather than raw client queries. Files live in Cloudflare R2 with a 1-hour auto-delete lifecycle rule, enforced by a monitored background cleanup job. Every upload passes through a ClamAV scan before a worker touches it. Razorpay handles subscription billing, and Cloudflare sits in front of everything as CDN and DDoS protection.

```
Internet
   │
Cloudflare CDN
   │
Nginx (reverse proxy, TLS, rate limiting)
   │
   ├── Next.js App (UI + API routes)
   │
   └── BullMQ API
          │
        Redis
          │
     Orchestrator
          │
   ┌──────┼───────┬─────────┐
   ▼      ▼       ▼         ▼
Document Image   (Video)   OCR
Worker  Worker   Worker*  Worker
   │      │                 │
Gotenberg ImageMagick/    Tesseract
          libvips
   │
ClamAV (pre-scan, all workers)
   │
Cloudflare R2 (storage)
   │
Supabase / Postgres (via Prisma)
   │
Monitoring: Sentry, Prometheus, Grafana
```

\* Video/Audio workers are built into the architecture but not exposed as a customer-facing feature at MVP (see PRD Section 2.3).

### 2.2 Core Components

| Component | Responsibility |
|-----------|-----------------|
| **Nginx (VM 1)** | TLS termination, reverse proxy, gzip/Brotli compression, static asset caching, rate limiting, security headers |
| **Next.js App Router (VM 1, Docker)** | Renders the UI and exposes REST/WebSocket API routes; orchestrates uploads, job creation, and plan-tier enforcement |
| **BullMQ + Redis (VM 1, Docker)** | Async job queue for conversions and merges; backs the daily merge-session counters and the dead-letter queue |
| **Orchestrator (VM 2, Docker)** | Selects the correct worker for a job, manages retries and priorities, and would balance load across multiple Gotenberg instances if added later |
| **Document Worker (VM 2, Docker)** | Handles PDF ↔ Word ↔ PPT via Gotenberg/LibreOffice |
| **Image Worker (VM 2, Docker)** | Handles JPG ↔ PDF ↔ PPT via ImageMagick/libvips/Sharp |
| **OCR Worker (VM 2, Docker)** | Extracts text from scanned PDFs/images via Tesseract |
| **ClamAV (VM 2, Docker)** | Scans every uploaded file before any worker processes it |
| **CloudConvert API (emergency backup only)** | Used only if Gotenberg itself is down; no longer a routine timeout fallback |
| **Prisma + Supabase (Postgres + Auth)** | User accounts, OAuth (Google), subscriptions, job metadata, Row-Level Security, accessed via a typed ORM layer |
| **Cloudflare R2** | Object storage for uploaded and converted files; 1-hour TTL lifecycle rule enforced by the background cleanup job |
| **Razorpay** | Subscription checkout, signature verification, and billing webhooks for Pro/Business plans |
| **Sentry** | Error tracking from day one |
| **Prometheus + Grafana** | Post-MVP metrics dashboards: CPU, RAM, queue length, conversion time, failure rate |
| **Cloudflare (CDN/DNS)** | Proxies all traffic, terminates DNS, provides automatic DDoS mitigation |

### 2.3 Request Flow — Conversion Job (v2.0)

1. Browser uploads the file in chunks directly to a signed Cloudflare R2 URL (resumable upload — see Section 17.4); no execution-time constraint applies since there's no serverless function in the path.
2. The API route validates MIME type and magic bytes, checks the user's plan-tier file-count limit, and writes a `conversion_jobs` row with status `queued`.
3. The file is queued for a **ClamAV scan**. If infected, the job is marked `rejected` and the user is notified; otherwise it proceeds.
4. A BullMQ job is enqueued; the **Orchestrator** reads the job type and routes it to the Document, Image, or OCR worker.
5. The worker streams percentage progress back through Redis pub/sub, exposed to the browser over a **WebSocket** connection (SSE remains available as a fallback for constrained networks).
6. On completion, the worker writes the output to R2, generates a first-page/sheet preview thumbnail, and marks the job `completed`. On repeated failure, the job moves to the **dead-letter queue** for manual inspection rather than disappearing silently.
7. The browser requests a short-lived signed download URL; the background cleanup job deletes the input and output from R2 on the 1-hour TTL regardless of whether it was downloaded.

---

## 3. Technology Stack

| Layer | Technology | Why / Notes |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router), React, TypeScript | One repo for UI and API routes — ideal for a solo developer |
| Styling | Tailwind CSS | Fast, consistent styling without heavy custom CSS |
| Forms | React Hook Form + Zod | Type-safe client-side and server-side validation |
| ORM | **Prisma** | Type-safe database queries, automatic migrations, fewer raw-SQL mistakes (see Section 19.1) |
| Database & auth | Supabase (Postgres, free tier) | Row-Level Security + built-in auth with Google OAuth |
| Reverse proxy | **Nginx** | TLS, compression, caching, rate limiting, security headers (see Section 19.5) |
| Conversion engine | **Gotenberg** (Docker) | LibreOffice wrapper; handles PDF, Word, and PPT conversions via HTTP API |
| Image engine | ImageMagick / libvips / Sharp | Handles JPG-based conversions in the Image Worker |
| OCR engine | Tesseract OCR | Text extraction for scanned PDFs and images |
| Malware scanning | **ClamAV** | Scans every upload before it reaches a worker (see Section 19.6) |
| Job queue | BullMQ + Redis | Async conversion/merge jobs; real-time progress via WebSocket/SSE |
| Orchestration (jobs) | Custom **Orchestrator service** | Routes jobs to the right worker, manages retries, priorities, dead-letter queue |
| Heavy-conversion emergency backup | CloudConvert API (free tier) | Used only if Gotenberg is unreachable; capped at 25 free conversions/day |
| File storage | Cloudflare R2 | Zero egress fees; 10GB free storage; 1-hour TTL auto-delete |
| Hosting | Cloud VM(s) — AWS/GCP/Azure/DigitalOcean/Oracle (student credits) | No serverless timeout; Docker Compose for local dev and small-scale production |
| Containerisation | Docker + Docker Compose | Every service runs as a container; Kubernetes-ready for later scaling |
| Payments | Razorpay | Free to integrate; per-transaction fee only; supports Indian payment methods |
| Error tracking | Sentry (free tier) | From day one |
| Metrics dashboards | **Prometheus + Grafana** | Post-MVP; visualises queue length, CPU/RAM, conversion time, failure rate |
| Tracing | **OpenTelemetry** | Post-MVP; pinpoints which service in the pipeline is slow (see Section 19.2) |
| Product analytics | **PostHog** | Post-MVP; usage analytics — most-used conversions, drop-off points (see Section 19.3) |
| Feature flags | **Flagsmith** | Post-MVP; toggle features per user segment without redeploying (see Section 19.4) |
| CDN + DDoS | Cloudflare (free) | Proxies all traffic; automatic DDoS mitigation |

**MVP-only stack (what to actually build first):** Next.js, Prisma, Supabase/Postgres, BullMQ, Redis, Cloudflare R2, Docker, Nginx, Gotenberg, ClamAV, Sentry, Razorpay. Everything under "post-MVP" above is added once there are real users to justify the operational overhead.

---

## 4. Data Model

All tables live in Supabase Postgres, accessed through Prisma, with Row-Level Security enabled so a user can only read or write their own rows.

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
| status | text | 'queued' \| 'scanning' \| 'processing' \| 'completed' \| 'failed' \| 'dead_letter' |
| worker_type | text | 'document' \| 'image' \| 'ocr' — replaces the old single `engine_used` field |
| engine_used | text | 'gotenberg' \| 'imagemagick' \| 'tesseract' \| 'cloudconvert' (emergency only) |
| retry_count | int | Incremented on each automatic retry; moves to dead-letter after the configured max |
| clam_scan_result | text | 'clean' \| 'infected' \| 'error' |
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

Real-time enforcement of daily limits (e.g. Pro's 10 merge sessions/day) happens against a Redis counter keyed by user id and UTC date, with a 24-hour expiry. This table is the durable mirror used for billing audits and analytics, written asynchronously after each job.

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

### 4.7 audit_logs *(new in v2.0)*

| Field | Type | Notes |
|-------|------|-------|
| id | uuid, PK | — |
| user_id | uuid, FK → users.id, nullable | Null for system-initiated actions |
| action | text | e.g. 'plan_upgraded', 'plan_cancelled', 'admin_login', 'job_force_retried' |
| metadata | jsonb | Structured details specific to the action |
| created_at | timestamptz | — |

---

## 5. API Specification

All routes are Next.js API routes under `/api`. Every state-changing route requires a valid session except `/api/feedback`, which is rate-limited instead. All routes sit behind Nginx.

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
| POST /api/convert/upload/init | Session | Initiates a resumable/chunked upload session and returns a signed R2 multipart URL set |
| PUT /api/convert/upload/chunk | Session | Uploads a single chunk; resumable if the connection drops |
| POST /api/convert/jobs | Session | Creates a conversion job after ClamAV scan passes; enforces the plan's per-session file-count limit server-side (HTTP 403 with upgrade prompt if exceeded) |
| GET /api/convert/jobs/:jobId | Session | Polls job status as a fallback when WebSocket is unavailable |
| WS /api/convert/jobs/:jobId/live | Session | WebSocket stream of percentage progress and current stage |
| GET /api/convert/jobs/:jobId/preview | Session | Returns the first-page/sheet preview thumbnail |
| GET /api/convert/jobs/:jobId/download | Session | Issues a short-lived signed download URL |

### 5.3 Merge

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/merge/sessions | Session | Creates a merge session; blocks Free, caps Pro at 10 files/10 sessions per day via the Redis counter, allows Business unrestricted |
| GET /api/merge/sessions/:id | Session | Status poll for a merge session |
| WS /api/merge/sessions/:id/live | Session | WebSocket progress stream |
| GET /api/merge/sessions/:id/download | Session | Signed download URL for the merged output |

### 5.4 Payments

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/payments/create-order | Session | Creates a Razorpay order for the selected plan |
| POST /api/payments/verify | Session | Verifies the Razorpay payment signature server-side and activates the plan |
| POST /api/payments/webhook | Razorpay signature | Receives subscription.charged / subscription.halted / subscription.cancelled events |

### 5.5 Support

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| POST /api/feedback | Public, rate-limited | Accepts Help page feedback form submissions |

### 5.6 Admin *(new in v2.0)*

| Method & Path | Auth | Purpose |
|---------------|------|---------|
| GET /api/admin/queue-metrics | Admin session | Live queue length, active workers, failure rate for the dashboard |
| GET /api/admin/jobs/dead-letter | Admin session | Lists jobs that exhausted retries, for manual inspection |
| POST /api/admin/jobs/:jobId/retry | Admin session | Manually re-queues a dead-lettered job |
| GET /api/admin/audit-logs | Admin session | Queries the audit_logs table with filters |

---

## 6. Conversion Engine — Implementation Notes

| Conversion | Worker | Primary Engine | Fallback / Notes |
|-----------|--------|-----------------|------------------|
| **PDF → Word** | Document | Gotenberg (LibreOffice) | Scanned PDFs route through the OCR Worker first; CloudConvert used only if Gotenberg itself is unreachable |
| **PDF → PPT** | Document | Gotenberg | Page regions are detected and mapped to slide content boxes |
| **PDF → JPG** | Image | poppler rasteriser / libvips | Each page rasterised at a user-selected DPI (150–300); multi-page output zipped before download |
| **JPG → PDF** | Image | pdf-lib | Images wrapped with A4 page metadata; multiple images become a multi-page PDF |
| **JPG → PPT** | Image | pptx generator | One slide per image, auto-layout with centre alignment |
| **Excel → CSV** | Document (in-process, lightweight) | SheetJS | Strips formatting, exports the active sheet, comma-delimited UTF-8 |
| **CSV → Excel** | Document (in-process, lightweight) | SheetJS | Parses delimiters, infers column types, applies basic table formatting |
| **Word → PDF** | Document | Gotenberg | Headless LibreOffice rendering |
| **Word → PPT** | Document | Gotenberg + custom mapper | H1 → slide title, H2 → subtitle, body paragraphs → bullet points |
| **Merge (PDF)** | Document | Gotenberg / pdf-lib | Concatenates pages in upload (or reordered) sequence |
| **Merge (Word)** | Document | python-docx or LibreOffice | Sequentially appends document bodies, preserving section breaks |
| **Merge (PPT)** | Document | python-pptx | Appends slides from each source deck in order |
| **Image to Text** | OCR | Tesseract | Extracts text from photos or scanned images (Phase 2 feature) |

Because there is no serverless timeout, every job now carries a **retry policy** instead of a timeout budget: up to 3 automatic retries with exponential backoff, then the job moves to the dead-letter queue and the Orchestrator alerts via Sentry. This is a strict improvement over the old approach of racing against an 8-second cutoff.

---

## 7. Security Architecture

### 7.1 Transport & Storage

- HTTPS is enforced on every route, terminated at Nginx; HSTS headers are set with a long max-age and includeSubDomains.
- Uploaded and converted files live in isolated Cloudflare R2 buckets, never on any VM's filesystem.
- An R2 lifecycle rule auto-deletes every object 1 hour after upload or download, whichever is later — enforced and monitored by the background cleanup job (Section 17.10).
- No file contents are ever written to logs — only metadata (size, type, timestamp, job id).

### 7.2 Input Validation & Malware Scanning

- Every upload is checked against both its declared MIME type and its magic bytes (file signature) — a renamed .exe must fail even if labelled .pdf.
- Every file additionally passes through a **ClamAV scan** before any worker touches it; infected files are rejected and logged, never processed.
- Maximum file size is enforced server-side in the upload API route, not only via the client-side dropzone.
- Filenames are sanitised before use in any storage key or path to prevent path traversal.

### 7.3 Application Security

- Rate limiting is applied at two layers: Nginx (connection-level) and a Redis sliding-window limiter (per-user, per-IP) on upload and job-creation endpoints.
- CSRF tokens protect all state-changing requests.
- A Content Security Policy header blocks inline scripts and external script injection; X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers are set on every response.
- Dependency vulnerabilities are scanned continuously via Dependabot and/or Snyk; every Docker image (Gotenberg, workers, ClamAV) is scanned with Trivy before deployment.
- Secrets (API keys, service-role keys, webhook secrets) are stored as environment variables injected into containers via Docker Compose secrets, never committed to the repository.
- Data handling is GDPR-aligned: no personal data is retained for unauthenticated or free-tier usage beyond what's needed to enforce limits.

### 7.4 Authorization Model

- Supabase Row-Level Security policies scope every table so a user can only read or write rows where user_id matches their own auth id.
- Plan-tier limits (file counts, merge access, daily session caps) are enforced server-side in the API route handler, never trusted from client input.
- The Razorpay webhook handler verifies the request signature before processing any subscription event.
- Admin routes require a separate admin-role check, logged to `audit_logs` on every access.

---

## 8. Authentication & Session Management

NextAuth is configured with the Supabase adapter, supporting email/password and Google OAuth. Sessions are JWT-based and short-lived, with silent refresh on activity. A thin middleware layer reads the session on every API route under `/api/convert`, `/api/merge`, `/api/payments`, and `/api/admin`, attaches the resolved plan tier to the request context, and rejects unauthenticated requests with HTTP 401 before any business logic runs.

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
4. The server recomputes the HMAC signature server-side; only on a match does it update the user's plan in Supabase and create a subscriptions row, and write an audit_logs entry.
5. The UI reflects the new plan badge and unlocks merge access within seconds, without a full page reload.

### 9.2 Webhook Events

| Event | Handling |
|-------|----------|
| subscription.charged | Extends current_period_end; ensures plan remains active |
| subscription.halted | Marks subscription status 'past_due'; user keeps access until current_period_end, then downgrades |
| subscription.cancelled | Marks subscription 'cancelled'; plan downgrades to free at the end of the current billing period |

---

## 10. CI/CD Pipeline

Every change flows through GitHub Actions before it can reach production. The pipeline is designed to fail closed: a red stage blocks merge or deploy. Deployment target is now the cloud VM(s), not Vercel/Railway.

| Stage | Tool / Method | Trigger |
|-------|---------------|---------|
| Lint + unit tests | ESLint, Jest | Every pull request |
| Static analysis (SAST) | Semgrep or CodeQL | Every pull request |
| Dependency scan | Dependabot / Snyk | Daily, automated |
| Container image build | Docker build (Next.js, workers, Gotenberg, ClamAV) | Every merge to main |
| Container image scan | Trivy | On every Docker build |
| Integration tests | Playwright against staging | Every merge to main |
| Dynamic analysis (DAST) | OWASP ZAP | Weekly, against staging |
| Penetration test checklist | Automated quarterly run | Quarterly, scheduled |
| Deploy | `docker compose pull && docker compose up -d` over SSH to the VM, or a GitHub Actions self-hosted runner | On release tag |
| Health check + auto-rollback | Container health checks + error-rate spike detection | Post-deploy |

**Branch strategy:** feature branches merge to main only after CI passes; main auto-deploys to a staging VM environment; a tagged release promotes staging to production via a rolling container restart, with automatic rollback to the previous image tag if the post-deploy health check detects an error-rate spike.

---

## 11. Testing Strategy

| Layer | Tooling | Coverage Focus |
|-------|---------|-----------------|
| Unit | Jest | Conversion option mapping, plan-limit logic, signature verification helpers |
| Integration / E2E | Playwright | Upload → scan → convert → download, login, payment, and merge user journeys |
| Static analysis | Semgrep / CodeQL | Injection, unsafe deserialization, and common JS/TS vulnerability patterns |
| Dynamic analysis | OWASP ZAP | Live scan of staging for XSS, injection, and misconfigured headers |
| Container scan | Trivy | CVEs in every Docker image (Gotenberg, workers, ClamAV, Next.js) |
| Malware scan validation | Manual test corpus | Confirms ClamAV correctly flags EICAR test files and passes clean files |
| Manual penetration checklist | Quarterly manual pass | SQL injection, XSS, IDOR on download URLs, CSRF, broken auth, path traversal |

**Acceptance bar** before any release: ESLint and Jest pass with zero errors, Semgrep/CodeQL report no high-or-critical findings, Trivy reports no critical/high CVEs in any container image, and the OWASP ZAP scan reports no medium-or-higher alerts on staging.

---

## 12. Implementation Plan — Phase & Day-Wise

Total estimated effort remains roughly 70–90 working days at 4–6 hours/day for a solo developer (see Section 20 for the full time-estimate breakdown by working style). Phases run sequentially; each ends with a testing checkpoint before the next begins.

### 12.1 Phase 1 — Project Setup & UI Shell (Days 1–15)

**Goal:** full UI built, navigation working, upload functional, no backend conversion yet.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 1–2 | Initialise the Next.js 14 project, GitHub repo, provision the two cloud VMs, install Docker + Docker Compose | Both VMs reachable via SSH; Docker running |
| 3–4 | Build the global layout: sticky header with dropdown nav and a footer mirroring all links | All nav links render; mobile touch works |
| 5–6 | Build the Home page: hero, feature grid, conversion-type cards, CTA to pricing | Pixel-accurate on desktop and mobile |
| 7–8 | Build the shared Upload component with resumable chunked upload support | Upload accepts valid files, resumes after a dropped connection |
| 9–10 | Build the 9 individual converter pages using the shared Upload component | Each page loads and uploads correctly; no conversion logic yet |
| 11–12 | Build the Merge page: multi-file upload, drag-to-reorder list, inline premium-gate UI | Merge UI renders; paywall shows for a free user |
| 13 | Build the Pricing page: Free/Pro/Business cards, comparison table, Razorpay button placeholders | Pricing page renders correctly |
| 14 | Build the Help & Support page: feedback form, FAQ accordion, contact info | Form renders; FAQ toggle works |
| 15 | Cross-browser and mobile testing of all pages | All pages pass visual QA |

### 12.2 Phase 2 — Authentication & Database (Days 16–22)

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 16–17 | Set up Supabase; define the schema with Prisma; create tables with RLS policies | `prisma migrate` runs clean; RLS prevents cross-user data access |
| 18–19 | Integrate NextAuth with the Supabase adapter; add email/password and Google OAuth sign-in | Sign up, log in, log out work end-to-end |
| 20–21 | Add session-aware UI: avatar, plan badge, logout in the header; hide premium features for free users | Free user sees the paywall; logged-out user is prompted to sign in |
| 22 | Test auth edge cases: expired session, invalid token, concurrent login, password reset | All edge cases handled gracefully |

### 12.3 Phase 3 — Core Infrastructure: Docker, Nginx, Redis, Orchestrator (Days 23–32)

**Goal:** the containerised backbone is running on both VMs before any conversion logic is added.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 23–24 | Write the Docker Compose files for VM 1 (Next.js, Nginx, Redis) and VM 2 (Orchestrator, Gotenberg, ClamAV) | `docker compose up` brings up all services with passing health checks |
| 25–26 | Configure Nginx: TLS via Let's Encrypt, reverse proxy rules, gzip/Brotli, rate limiting, security headers | SecurityHeaders.com reports grade A; rate limiting blocks abuse |
| 27–28 | Set up BullMQ with Redis; build the Orchestrator service skeleton with a job-routing table | A test job is correctly routed to a stub worker |
| 29 | Integrate ClamAV as a pre-processing step; test against the EICAR test file | Infected test file is rejected; clean files pass through |
| 30 | Set up the Cloudflare R2 bucket; implement secure chunked upload from Next.js to R2; configure the 1-hour TTL lifecycle rule | Files upload to R2 in chunks; auto-delete after 1 hour confirmed |
| 31 | Implement the WebSocket progress channel (with SSE fallback) | A test job streams live percentage updates to the browser |
| 32 | End-to-end smoke test of the full pipeline with a stub conversion | Upload → scan → queue → stub-convert → download all succeed |

### 12.4 Phase 4 — Conversion Engine: Document, Image, OCR Workers (Days 33–52)

**Goal:** all 9 conversion types live and working across the correct dedicated workers.

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 33–34 | Stand up the Document Worker container with Gotenberg; confirm the Orchestrator routes PDF/Word/PPT jobs to it | Gotenberg health endpoint returns 200; routed jobs succeed |
| 35–36 | Implement PDF→Word with an OCR Worker hand-off for scanned PDFs | Native and scanned PDFs both convert accurately |
| 37–38 | Implement PDF→PPT; validate slide layout output quality | Output slides are readable; layout is acceptable |
| 39 | Stand up the Image Worker container (ImageMagick/libvips); implement PDF→JPG (150–300 DPI, zipped multi-page) | Single- and multi-page PDFs both produce correct JPG output |
| 40 | Implement JPG→PDF and JPG→PPT on the Image Worker | Both conversions produce correct output |
| 41 | Implement Excel→CSV and CSV→Excel using SheetJS (lightweight, in-process) | Both conversions preserve data correctly |
| 42–43 | Implement Word→PDF and Word→PPT via Gotenberg | Heading hierarchy maps correctly to PPT slides |
| 44–45 | Enforce the free-tier 2-files-per-session limit server-side; return 403 with an upgrade prompt when exceeded | Free user is blocked at the 3rd file; Pro user succeeds |
| 46 | Implement file preview: first-page/sheet thumbnail generation, shown before download | Thumbnail shown for every supported type |
| 47 | Implement retry policy and dead-letter queue on the Orchestrator | A repeatedly-failing job lands in the dead-letter queue after 3 retries |
| 48–49 | Stand up the OCR Worker (Tesseract); implement Image-to-Text as a Phase-2 feature stub | OCR Worker extracts text correctly from a test image |
| 50–52 | End-to-end testing of all 9 conversion types against valid, invalid, large, small, scanned, and corrupt files | All types pass with a >95% success rate on the test corpus |

### 12.5 Phase 5 — Payments & Premium Merge (Days 53–62)

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 53–54 | Integrate Razorpay: create the order server-side, open the checkout modal client-side, verify the payment signature server-side | Test payment completes; signature verification passes |
| 55 | On successful payment, update the user's plan in Supabase and unlock premium features immediately | User sees the Pro badge and merge access within 5 seconds of payment |
| 56 | Implement the subscription webhook: handle subscription.charged, subscription.halted, subscription.cancelled | Plan downgrades correctly on cancellation |
| 57–58 | Implement the merge backend on the Document Worker (up to 10 files for Pro) | A 10-file merge produces a correct output for all three file types |
| 59 | Enforce merge session limits (10/day Pro, unlimited Business) via the Redis daily counter | Pro user is blocked on the 11th session; Business user is unrestricted |
| 60 | Build the inline upgrade prompt on the merge page for free users, with one-tap Razorpay upgrade | Free user can upgrade without leaving the merge page |
| 61–62 | End-to-end payment and merge testing: happy path, failed payment, expired card, downgrade, re-upgrade | All payment scenarios are handled correctly |

### 12.6 Phase 6 — Security Hardening & CI/CD (Days 63–72)

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 63 | Confirm HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers on all responses | SecurityHeaders.com reports grade A |
| 64 | Implement per-user Redis rate limiting on upload/conversion endpoints, layered with Nginx-level limits | Abuse requests are blocked; legitimate requests pass |
| 65 | Confirm magic-bytes validation and ClamAV are both mandatory before any worker runs | A renamed .exe and an EICAR test file are both rejected |
| 66 | Set up the GitHub Actions CI pipeline: lint, Jest, Semgrep SAST, Dependabot on every PR | Pipeline runs and passes on a sample PR |
| 67 | Set up the Playwright integration suite covering upload, scan, convert, download, login, and payment flows | All critical user journeys pass in CI |
| 68 | Set up Trivy container scanning on every Docker image | No critical or high CVEs in any image |
| 69 | Wire the deploy stage: Docker build → push to registry → pull + restart on both VMs | A tagged release deploys cleanly to staging |
| 70 | Run the OWASP ZAP DAST scan against staging; fix any medium-or-higher findings | ZAP reports no medium+ alerts |
| 71 | Configure Sentry error tracking and an uptime monitoring alert for both VMs | Errors appear in Sentry; downtime triggers an alert |
| 72 | Run the penetration test checklist: SQL injection, XSS, IDOR on download URLs, CSRF, broken auth, path traversal | All checklist items pass or are mitigated |

### 12.7 Phase 7 — Monitoring, Polish, QA & Launch (Days 73–85)

| Day(s) | Task | Testing Checkpoint |
|--------|------|-------------------|
| 73–74 | Stand up Prometheus + Grafana; build a dashboard for CPU, RAM, queue length, conversion time, failure rate | Dashboard reflects live metrics from both VMs |
| 75 | Build the admin dashboard page: live queue metrics, dead-letter job list, manual retry button | Admin can view metrics and retry a failed job |
| 76–77 | Full cross-browser QA (Chrome, Firefox, Safari; desktop + mobile); fix visual/functional regressions | All pages pass on all browsers |
| 78 | SEO: meta titles, descriptions, Open Graph tags, robots.txt, sitemap.xml | Google Search Console reports no errors |
| 79 | Performance audit with Lighthouse; optimise images, lazy-load off-screen content, confirm Core Web Vitals | Lighthouse score >85 on mobile |
| 80 | Write user-facing documentation: FAQ and how-to guides for each conversion type on the Help page | Help page content is complete and accurate |
| 81 | Set up the custom domain; configure Cloudflare DNS/proxy and DDoS protection | Site loads on the custom domain; Cloudflare is active |
| 82 | Implement the background cleanup service as a scheduled job, monitored in Grafana | R2 objects older than 1 hour are confirmed deleted |
| 83 | Soft launch to 5–10 beta users; collect feedback via the Help form | At least 3 conversions completed by beta users |
| 84 | Address critical beta feedback | No P0 bugs open |
| 85 | Tag the v2.0 release; full deploy to production | v2.0 is live on both VMs; Grafana dashboards green |

### 12.8 Phase Summary

| Phase | Focus | Days | End Milestone |
|-------|-------|------|---------------|
| 1 | UI Shell | 1–15 | Full UI live on a staging VM URL |
| 2 | Authentication | 16–22 | Sign-up, login, plan-tier enforcement working |
| 3 | Core Infra | 23–32 | Docker/Nginx/Redis/Orchestrator running on both VMs |
| 4 | Conversion Engine | 33–52 | All 9 conversion types live across dedicated workers |
| 5 | Payments & Merge | 53–62 | Paying users unlock merge; Razorpay live |
| 6 | Security & CI/CD | 63–72 | Pipeline running; ClamAV mandatory; ZAP scan passes |
| 7 | Monitoring & Launch | 73–85 | v2.0 live; Grafana dashboards live; admin dashboard live |

---

## 13. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Average page load <2s at launch, <1.5s by Month 6; conversion success rate >95% at launch, >98% by Month 6 |
| **Scalability** | Async, queue-based job processing decouples upload spikes from conversion throughput; the two-VM split plus per-type workers supports roughly 10,000 jobs/day without further architecture change; horizontal worker scaling (more worker containers, or more VMs) is the next lever |
| **Availability** | Best-effort uptime on student-credit infrastructure at launch; container health checks auto-restart failed services; a paid VM tier is the first upgrade once revenue starts |
| **Reliability** | Failed jobs are retried automatically up to 3 times with exponential backoff, then moved to the dead-letter queue for manual review rather than silently failing |
| **Data retention** | Uploaded and converted files are never retained beyond the 1-hour TTL; only job metadata persists |
| **Accessibility** | Touch targets ≥44px on mobile; identical layout structure across breakpoints, not a reduced mobile experience |
| **Maintainability** | TypeScript throughout; conversion engines isolated behind worker containers so a new engine can be added as a new plugin without touching existing worker or API logic |
| **Security** | Every uploaded file is scanned for malware before processing; every container image is scanned for CVEs before deployment |

---

## 14. Monitoring & Observability

- Sentry captures unhandled exceptions and failed API routes, with alerts on new error types.
- **Prometheus** scrapes metrics from Next.js, Redis, BullMQ, and each worker container; **Grafana** visualises them on a live dashboard (conversions today, success rate, failed jobs, average conversion time, queue length, CPU/RAM per VM).
- **OpenTelemetry** traces a request end-to-end (Next.js → BullMQ → Orchestrator → worker → Gotenberg → R2), making it possible to see exactly which hop is slow instead of guessing.
- An uptime check pings the Gotenberg health endpoint, the Orchestrator, and the main site on a short interval, alerting on downtime.
- The post-deploy health check watches error-rate for a window after each release and triggers an automatic rollback if it spikes.
- The admin dashboard (Section 5.6) surfaces the same queue metrics inside the product itself for day-to-day operational use, without needing to open Grafana.

---

## 15. Infrastructure & Cost Plan

Deployment now runs on two cloud VMs funded by student credits, rather than Vercel + Railway. Everything else stays free/open-source at launch.

| Service | Free Tier / Credit-Funded | Upgrade Trigger | Paid Cost (indicative) |
|---------|---------------------------|-----------------|--------------------------|
| Cloud VM 1 (web tier) | Student credits (AWS/GCP/Azure/DO/Oracle) | Credits exhausted or traffic outgrows the instance size | ~$5–10/month for a small VM |
| Cloud VM 2 (worker tier) | Student credits | Credits exhausted, or conversion volume needs a bigger/second worker VM | ~$10–20/month depending on CPU needs |
| Docker / Docker Compose | Free forever | — | — |
| Nginx | Free forever | — | — |
| Redis (self-hosted in Docker) | Free forever | Queue volume outgrows a single VM's RAM | Managed Redis (~$0.20/100K ops) if migrated later |
| Supabase | 500MB DB, 50,000 MAU free | DB >500MB or MAU >50,000 | $25/month |
| Cloudflare R2 | 10GB storage, 10M reads free | Storage >10GB | $0.015/GB |
| CloudConvert (emergency backup only) | 25 conversions/day free | Rarely triggered now — only on Gotenberg outage | Pay-per-use |
| Cloudflare CDN | Unlimited (free forever) | — | — |
| Razorpay | No monthly fee | — | 2% per transaction |
| Sentry | 5,000 errors/month free | Errors >5,000/month | $26/month |
| Prometheus + Grafana (self-hosted) | Free forever | — | Grafana Cloud free tier available if preferred over self-hosting |
| ClamAV | Free forever, open source | — | — |

**Estimated monthly infrastructure cost at launch:** ₹0 (covered by student credits). The first out-of-pocket cost is typically the VM hosting once credits run out — budget roughly $15–30/month combined for both VMs as a fallback, comfortably covered once there are around 10–15 paying subscribers (≈₹890–1,335/month in revenue).

---

## 16. Appendix — Environment Variables

| Variable | Purpose |
|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Client-side Supabase connection |
| SUPABASE_ANON_KEY | Client-side Supabase connection |
| SUPABASE_SERVICE_ROLE_KEY | Server-side privileged Supabase access (job writes, admin actions) |
| DATABASE_URL | Prisma connection string to Supabase Postgres |
| NEXTAUTH_SECRET | Session token signing |
| GOOGLE_CLIENT_ID | Google OAuth |
| GOOGLE_CLIENT_SECRET | Google OAuth |
| R2_ACCOUNT_ID | Cloudflare R2 storage access |
| R2_ACCESS_KEY_ID | Cloudflare R2 storage access |
| R2_SECRET_ACCESS_KEY | Cloudflare R2 storage access |
| R2_BUCKET | Cloudflare R2 storage access |
| REDIS_URL | BullMQ queue, rate-limit, and usage-counter connection |
| GOTENBERG_URL | Internal URL of the Document Worker's Gotenberg container |
| CLAMAV_HOST / CLAMAV_PORT | Internal address of the ClamAV daemon container |
| ORCHESTRATOR_URL | Internal URL of the Orchestrator service |
| CLOUDCONVERT_API_KEY | Emergency-only fallback conversion API |
| RAZORPAY_KEY_ID | Payment order creation and signature verification |
| RAZORPAY_KEY_SECRET | Payment order creation and signature verification |
| RAZORPAY_WEBHOOK_SECRET | Webhook authentication |
| SENTRY_DSN | Error tracking |
| PROMETHEUS_METRICS_PORT | Port each service exposes for Prometheus scraping |

---
---

# Part 3: v2.0 Additions

## 17. New Features — Full Specification

Each feature below was pulled directly from the architecture discussion and given a concrete build spec so it's implementable rather than just a name on a list.

### 17.1 AI-Powered Conversion Recommendations

When a user uploads a file, a lightweight classifier (or a call to an LLM API) inspects the file's content and suggests the most likely useful output format and settings — e.g. a scanned PDF gets an "OCR to searchable PDF" suggestion instead of a generic PDF→Word prompt. This is a UX layer on top of the existing conversion catalogue, not a new conversion engine.

### 17.2 Intelligent File-Type Detection

Instead of trusting the file extension, the upload handler inspects magic bytes and (for ambiguous cases) file structure to determine the true type before routing to a worker. This closes a real security gap — a `.pdf` that's actually a disguised executable is caught here, before ClamAV even runs.

### 17.3 Malware / Virus Scanning (ClamAV)

Every file is scanned by a ClamAV daemon container immediately after upload and before any worker processes it. Infected files are rejected with a clear, non-technical error message and logged for review. This is mandatory infrastructure once the product accepts uploads from the public internet — see Section 19.6 for the full explanation of why.

### 17.4 Resumable & Chunked Uploads

Large files are split into chunks client-side and uploaded to R2 via multipart upload URLs. If a connection drops mid-upload, the client resumes from the last successfully-uploaded chunk instead of restarting from zero — important for students on unreliable campus Wi-Fi or mobile data.

### 17.5 Real-Time Progress via WebSockets

Replaces the SSE-based progress stream with a persistent WebSocket connection, allowing genuinely bidirectional communication (e.g. the client can cancel a job mid-flight). SSE remains as an automatic fallback on networks/proxies that block WebSocket upgrades.

### 17.6 Plugin-Based Conversion Engine

Each worker type (Document, Image, OCR, and future Video/Audio) is built as an isolated container implementing a common job interface (`{input, sourceType, targetType} → {output, status}`). Adding a new conversion type means writing a new worker plugin and registering it with the Orchestrator — no changes to existing workers, the API layer, or the queue.

### 17.7 Dead-Letter Queue & Retry Policies

Every job gets up to 3 automatic retries with exponential backoff. A job that still fails after 3 attempts moves to a dedicated dead-letter queue instead of vanishing, where it's visible on the admin dashboard for manual inspection or a forced retry.

### 17.8 Distributed Locking & Idempotency

Where a job could otherwise be processed twice (e.g. a retry racing with a still-running attempt, or a webhook firing twice), a Redis-based distributed lock keyed by job id ensures only one worker processes a given job at a time, and job handlers are written to be safely re-runnable.

### 17.9 Admin Dashboard

An internal-only page (Section 5.6 APIs) showing: current queue length per worker type, active vs. failed jobs, CPU/RAM per VM (pulled from Prometheus), and a list of dead-lettered jobs with a manual retry button. This is the solo developer's primary operational tool once the product has real traffic.

### 17.10 Background Cleanup / Lifecycle Management

The existing 1-hour R2 TTL is formalised into a scheduled job (rather than relying solely on the R2 lifecycle rule) that also writes a completion metric to Prometheus, so the developer can confirm cleanup is actually running rather than assuming it is.

### 17.11 Usage Analytics & Audit Logs

Usage analytics (which conversions are most popular, where users drop off before converting) informs product priorities. Audit logs (Section 4.7) record account- and billing-relevant actions for accountability, and are exposed to Business-plan users and the admin dashboard.

---

## 18. Deployment Architecture — Cloud VM / Docker Compose

### 18.1 Why Two VMs

Running the web tier and the worker tier on separate machines means a burst of CPU-intensive conversions (e.g. 100 users uploading large files at once) never makes the marketing site or login flow feel slow — the two workloads simply don't compete for the same CPU.

| VM | Runs | Sizing Guidance |
|----|------|-------------------|
| VM 1 — Web Tier | Next.js, Nginx, Redis | Lighter — optimise for request latency, not CPU |
| VM 2 — Worker Tier | Orchestrator, BullMQ workers, Gotenberg, ClamAV | Heavier — optimise for CPU/RAM, since conversions are compute-bound |

### 18.2 Docker Compose Layout

```
docker-compose.web.yml   (VM 1)
  - nextjs
  - nginx
  - redis

docker-compose.workers.yml   (VM 2)
  - orchestrator
  - document-worker  (Gotenberg)
  - image-worker
  - ocr-worker
  - clamav
  - prometheus
  - grafana
```

Docker Compose is deliberately kept simple for a solo developer. Kubernetes is not recommended until traffic genuinely requires multi-node autoscaling — Compose is sufficient well past the first few thousand users.

### 18.3 Suggested Cloud Providers (Student Credits)

AWS, Google Cloud, Microsoft Azure, DigitalOcean, and Oracle Cloud all offer meaningful student credit programs suitable for this workload. DigitalOcean and Oracle Cloud tend to have simpler pricing for a solo developer running two small VMs; AWS/GCP/Azure offer more generous credits but a steeper learning curve. The architecture above is provider-agnostic — it's just two Linux VMs with Docker installed.

### 18.4 Path to Scale (Not Built Now, But Designed For)

| Users | Infrastructure Needed |
|-------|------------------------|
| 10–1,000 | Two VMs as described — current design |
| 1,000–10,000 | Add more worker containers on VM 2, or a second worker VM |
| 10,000–100,000 | Move to Kubernetes; add a managed Redis and Postgres |
| 100,000+ | Multi-region deployment; autoscaling worker pools |

FileConvert is being built to reach the "1,000–10,000 users" tier without a redesign; anything beyond that is a deliberate future project, not something to over-engineer for today.

---

## 19. Supporting-Tool Reference

Plain explanations of the newer tools introduced in this discussion, for quick reference.

### 19.1 ORM (Prisma)

An ORM lets the app query the database using TypeScript instead of raw SQL:

```javascript
const user = await prisma.user.findUnique({ where: { id: userId } });
```

instead of `SELECT * FROM users WHERE id = ?`. Benefits: type safety, automatic migrations, fewer SQL mistakes, easier maintenance. **Use from the MVP** — the cost of adopting it later, once the schema has grown, is much higher.

### 19.2 Tracing (OpenTelemetry)

Tracing shows where time is actually spent as a request crosses multiple services. If a conversion takes 8 seconds, tracing can show it's 6 seconds waiting in the queue rather than 6 seconds inside Gotenberg — turning "the app is slow" into a specific, fixable bottleneck. **Add post-MVP**, once there's real traffic worth diagnosing.

### 19.3 PostHog

A product-analytics platform that shows how people actually use the app: sign-ups per day, which conversion type is most popular, where users abandon the flow before converting. **Add post-MVP** — not needed before there are users to analyse.

### 19.4 Flagsmith

A feature-flag service that turns features on/off (or on for a subset of users) without a redeploy — useful for gradually rolling out a new conversion type or quickly disabling a buggy feature. **Add post-MVP**.

### 19.5 Nginx

A reverse proxy sitting in front of the app. It terminates HTTPS, load-balances, compresses responses (gzip/Brotli), caches static files, applies rate limiting, and sets security headers — offloading all of that from the Next.js application itself. **Required from day one** once deploying to a self-managed VM, since Vercel used to handle this automatically.

### 19.6 ClamAV

An open-source antivirus engine that scans uploaded files before they're processed. Without it, a malicious Office document or disguised executable could reach LibreOffice/Gotenberg and potentially compromise the worker. **Required from day one** for a public SaaS accepting arbitrary uploads.

### 19.7 Grafana + Prometheus

Prometheus collects metrics (CPU, RAM, queue length, conversion time, failure counts) from every service; Grafana turns those metrics into live dashboards, so a slow-conversion complaint can be diagnosed by looking at a graph instead of manually reading logs. **Add post-MVP**, once there's enough traffic that manual log-reading stops scaling.

### 19.8 What's Genuinely Free

Nearly everything in this stack is free or open-source: Next.js, React, Tailwind, TypeScript, Prisma, PostgreSQL, BullMQ, Redis, Docker, Gotenberg, LibreOffice, ImageMagick, Sharp, Tesseract, ClamAV, Nginx, Prometheus, Grafana, and OpenTelemetry all cost nothing in software licensing. Supabase, Sentry, PostHog, and Flagsmith all have workable free tiers. The only real, unavoidable cost as the product grows is cloud infrastructure itself (VM hours, storage, bandwidth) — which student credits cover at launch.

---

## 20. Build Timeline Estimate

| Working Style | Estimated Time to v2.0 |
|----------------|--------------------------|
| Part-time, 4–6 hrs/day, solo | 4–6 months |
| Full-time, 8–10 hrs/day, solo | 2–3 months |
| Team of 4, full-time | 6–8 weeks for an MVP-equivalent scope |

### Recommended Phased Focus (for a solo, part-time build)

| Month | Focus |
|-------|-------|
| 1 | Authentication, Cloudflare R2 uploads, PDF ↔ Word, PDF Merge, PDF Compress |
| 2 | Image conversions, BullMQ + Orchestrator, Docker Compose, VM deployment |
| 3 | OCR, ClamAV, payments, admin dashboard |
| 4 | Monitoring (Prometheus/Grafana), security hardening, performance tuning, public launch |

This mirrors the day-wise plan in Section 12 but expressed as a monthly view for planning purposes. Given prior experience with Next.js, Supabase, Docker, and AI-assisted development, 3–4 months is a realistic target for a polished v2.0 if work stays consistent — building the full "enterprise" feature set (multi-region, Kubernetes, video/audio conversion) from day one would take considerably longer and isn't necessary before the product has real users to justify it.

---

## End of Documentation

**FileConvert PRD v2.0 + TRD v2.0 + v2.0 Additions — Complete Reference**
Incorporates the cloud-VM deployment pivot and all new features discussed. All v1.1/v1.0 content that remained accurate has been preserved; everything Vercel-timeout-specific has been replaced.
