# FileConvert — Product Requirements Document (PRD)

**Version:** 1.1 (Consolidated)
**Date:** June 2026
**Status:** Final — Ready for Development
**Author:** Product Owner / Solo Developer
**Tech Stack:** Next.js 14 | Node.js | Gotenberg | Cloudflare R2 | Supabase
**Pricing:** Free | Pro: ₹89/month | Business: ₹150/month
**Companion Doc:** See FileConvert — Technical Requirements Document (TRD) v1.0

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Scope & Constraints](#2-scope--constraints)
3. [Feature Specifications](#3-feature-specifications)
4. [Website Structure & UX](#4-website-structure--ux)
5. [Pricing & Plans](#5-pricing--plans)
6. [Security & Trust Requirements](#6-security--trust-requirements)
7. [Release Roadmap Summary](#7-release-roadmap-summary)
8. [Risk Register](#8-risk-register)
9. [Appendix — Glossary](#9-appendix--glossary)

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
|---|---|---|
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
- Vercel's free-tier function timeout is 10 seconds, so large or complex PDF jobs are routed through the CloudConvert API (25 free conversions/day) instead of processing in-line.

---

## 3. Feature Specifications

### 3.1 Conversion Catalogue

Every conversion type follows the same user flow: **Upload → Validate → Convert → Preview → Download**. All 9 conversion types are available on every plan; the free plan is limited to 2 files per session.

| Conversion | Free Limit | How It Works | Key Constraint |
|---|---|---|---|
| PDF → Word (.docx) | 2 files | OCR for scanned PDFs; native parsing for text PDFs via Gotenberg/LibreOffice | Large files routed to CloudConvert |
| PDF → PowerPoint (.pptx) | 2 files | Detected page regions mapped to slide content boxes | Layout accuracy varies on complex PDFs |
| PDF → JPG | 2 files | Each page rasterised at 150–300 DPI; multi-page output delivered as a ZIP | DPI/quality selector available |
| JPG → PDF | 2 files | Images wrapped with A4 page metadata; multiple images produce a multi-page PDF | — |
| JPG → PPT | 2 files | One slide created per image, auto-layout with centre alignment | — |
| Excel → CSV | 2 files | Strips formatting, exports the active sheet, comma-delimited UTF-8 output | — |
| CSV → Excel | 2 files | Parses delimiters, infers column types, applies basic table formatting | — |
| Word → PDF | 2 files | Headless rendering via the Gotenberg/LibreOffice stack | — |
| Word → PPT | 2 files | H1 maps to slide title, H2 to subtitle, body paragraphs become bullet points | — |

### 3.2 Upload & Conversion UX Flow

| Step | User Action | System Behaviour |
|---|---|---|
| 1. Upload | Drag-and-drop or click to browse | File type and size validated via MIME type and magic bytes; clear error shown for invalid files |
| 2. Progress | Wait | Upload progress bar shown in real time (percentage + file name) |
| 3. Convert | Click Convert | Job is queued; real-time percentage progress streamed via SSE or polling |
| 4. Preview | Auto-shown | Thumbnail of the first page or sheet displayed before download |
| 5. Download | Click Download | File served securely; auto-deleted from storage after 1 hour |

### 3.3 File Merge Feature

Merge lets users combine multiple files of the same type (PDF, Word, or PPT) into one output. Files merge in upload order by default, and drag-to-reorder is available before merging. The upgrade prompt shown to free users on the merge page is **inline** (not a redirect), with one-tap payment and immediate feature unlock.

| Tier | Files per Merge | Sessions per Day | Price |
|---|---|---|---|
| Free | Blocked — inline upgrade prompt shown | — | ₹0 |
| Pro | Up to 10 files | Up to 10 sessions | ₹89/month |
| Business | Unlimited | Unlimited | ₹150/month |

### 3.4 Future Features (Phase 2+)

#### High Value — Easy to Add

- **Compress PDF** — reduce file size before or after conversion.
- **PDF Page Extractor** — pull specific page ranges from a multi-page PDF.
- **Image to Text (OCR)** — extract text from a photo or scanned image.
- **Password-protect PDF** — add or remove a PDF password.
- **Watermark PDF** — overlay a text or image watermark on every page.

#### Growth Features

- Conversion history dashboard for logged-in users.
- Shareable download links to send converted files to others.
- Google Drive and Dropbox integration for import and export.
- API access on the Business plan for developer automation.
- Bulk ZIP download after a batch conversion.

#### Trust & Retention Features

- File preview before download (thumbnail of the first page) — already in MVP scope.
- Quality selector for PDF to JPG (screen / print / high-res) — already in MVP scope.
- Dark mode toggle.
- Conversion-progress email notification for large files.

---

## 4. Website Structure & UX

### 4.1 Navigation

- **Sticky top bar:** logo top-left; dropdown menus for PDF, Image, Spreadsheet, and Word tools; a direct Merge link; Help; Login/Sign Up.
- A Help icon is always visible in the **top-left corner** of every page.
- The footer mirrors every navigation link individually for SEO and accessibility.
- Every conversion type and the merge feature are reachable from both the header dropdowns and the footer links.

### 4.2 Design System

- **Colour palette:** simple and clean; no dark backgrounds; no heavy animations or motion effects. Photos used as background textures/atmospheres with overlay, not as dark UI surfaces.
- **Responsive:** the same layout structure is used on desktop and mobile — not a stripped-down mobile view.
- **Mobile-interactive:** all buttons, dropdowns, and upload areas are touch-friendly (minimum 44px tap targets).
- **Font:** a system-safe sans-serif (Inter or system-ui).
- No dark mode at launch (Phase 2 addition).

### 4.3 Pages

| Page | Route | Purpose |
|---|---|---|
| Home / Landing | / | Hero, tool grid, how-it-works, pricing teaser |
| Converter (reusable template) | /convert/[type] | One page per conversion type, shared upload/progress/download flow |
| Merge | /merge | Multi-file merge, plan-gated |
| Pricing | /pricing | Plan cards + feature comparison table |
| Help & Support | /help | Feedback form, FAQ, contact email |
| Log In / Sign Up | /auth | Email/password + Google OAuth |
| Account | /account | Plan badge, usage summary, upgrade/downgrade, logout |

### 4.4 Help & Support Page

- Accessible from the top-left Help icon on every page.
- Feedback form with Name, Email, Message, and Category (Bug / Feature Request / Billing / Other).
- Contact email displayed.
- FAQ section covering common conversion questions.
- Stated response SLA (e.g. reply within 48 hours).

---

## 5. Pricing & Plans

| Feature | Free | Pro (₹89/mo) | Business (₹150/mo) |
|---|---|---|---|
| All 9 conversion types | Yes | Yes | Yes |
| Files per conversion session | 2 | 10 | Unlimited |
| File merge (PDF, Word, PPT) | No | Yes | Yes |
| Merge sessions per day | — | 10 | Unlimited |
| Files per merge session | — | 10 | Unlimited |
| File preview before download | Yes | Yes | Yes |
| Priority processing queue | No | Yes | Yes |
| API access | No | No | Yes (Phase 2) |
| Cloud storage integration | No | No | Yes (Phase 2) |

**Payment gateway:** Razorpay (free to integrate; charges apply per transaction only).
**Billing:** Monthly, auto-renewing.
**Cancellation:** On cancellation, the account instantly downgrades to the free tier at the end of the current billing period.

---

## 6. Security & Trust Requirements

FileConvert handles user-uploaded documents, so it must launch with no known vulnerabilities and with security testing built into every release. The product-level requirements below are implemented and verified in detail in the companion TRD, Section 7 (Security Architecture) and Section 10 (CI/CD & Testing Strategy).

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

Total estimated effort is **70 working days** at 4–6 hours/day (roughly 12–14 calendar weeks) for a solo developer. The full day-by-day build plan is maintained in the TRD, Section 12.

| Phase | Focus | Days | End Milestone |
|---|---|---|---|
| 1 | UI Shell | 1–15 | Full UI live on a Vercel preview URL |
| 2 | Authentication | 16–22 | Sign-up, login, and plan-tier enforcement working |
| 3 | Conversion Engine | 23–42 | All 9 conversion types live |
| 4 | Payments & Merge | 43–52 | Paying users unlock merge; Razorpay live |
| 5 | Security & CI/CD | 53–62 | Pipeline running; OWASP ZAP scan passes |
| 6 | Polish & Launch | 63–70 | v1.0 live on the production domain |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PDF-to-PPT layout quality is inconsistent | High | Medium | Set expectations in the UI ('layout may vary'); allow manual re-ordering of slides |
| Vercel's 10s function timeout affects large PDFs | Medium | High | Route heavy jobs to CloudConvert; consider an early Railway upgrade |
| CloudConvert's 25/day free limit is exceeded | Medium | Medium | Queue overflow requests, notify the user of delay, upgrade to a paid tier from first revenue |
| Razorpay merchant KYC delays go-live | Medium | High | Start Razorpay merchant registration in Phase 4, before it is needed; KYC can take 3–5 business days |
| Gotenberg's Railway free tier hits its hour limit | Low | Medium | Monitor usage; upgrade to Railway's paid tier when approaching the limit |
| A security vulnerability surfaces in file parsing | Low | High | Strict MIME + magic bytes validation, isolated container execution, and aggressive auto-delete of stored files |

---

## 9. Appendix — Glossary

| Term | Meaning |
|---|---|
| Gotenberg | A Docker-based, LibreOffice-backed HTTP API used to convert PDF, Word, and PPT files headlessly. |
| CloudConvert | A third-party conversion API used as a fallback for heavy jobs that would exceed Vercel's function timeout. |
| RLS | Row-Level Security — a PostgreSQL/Supabase feature that restricts each user's database access to their own rows. |
| SSE | Server-Sent Events — a one-way stream used to push real-time conversion progress to the browser. |
| TTL | Time To Live — here, the 1-hour window after which an uploaded or converted file is auto-deleted from storage. |
| DPI | Dots Per Inch — the resolution used when rasterising PDF pages to JPG. |
| CSP | Content Security Policy — a response header that restricts which scripts and resources a page may load. |
| HSTS | HTTP Strict Transport Security — a header that forces browsers to use HTTPS for all future requests. |
| Magic bytes | The first few bytes of a file that identify its true type, used to verify uploads regardless of file extension. |
| Razorpay | The payment gateway used for Pro/Business subscriptions, supporting Indian payment methods. |

---

*End of Document — FileConvert PRD v1.1*
