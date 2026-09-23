<div align="center">

  <img src="/public/logo.png" alt="FileConvert Logo" width="160" />

  # FileConvert

  ### **The Open-Source, Distributed Document Conversion & Processing Engine**

  *Transform, merge, rasterize, and OCR documents at scale with enterprise-grade security, real-time malware scanning, and sub-second queue dispatch.*

  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#%EF%B8%8F-system-architecture">Architecture</a> •
    <a href="#-supported-conversions--engines">Conversions</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#%EF%B8%8F-security--hardening">Security</a> •
    <a href="#-cicd-pipeline">CI/CD</a> •
    <a href="#-self-hosting--docker">Self-Hosting</a>
  </p>

  <p align="center">
    <a href="https://github.com/Skedare240507/FileConvert/releases"><img src="https://img.shields.io/github/v/release/Skedare240507/FileConvert?style=flat-square&color=4F46E5" alt="Release" /></a>
    <a href="https://github.com/Skedare240507/FileConvert/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://github.com/Skedare240507/FileConvert/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Skedare240507/FileConvert/ci.yml?branch=main&style=flat-square&label=CI%20Pipeline&logo=githubactions&logoColor=white" alt="CI Status" /></a>
    <a href="https://github.com/Skedare240507/FileConvert/actions/workflows/codeql.yml"><img src="https://img.shields.io/github/actions/workflow/status/Skedare240507/FileConvert/codeql.yml?branch=main&style=flat-square&label=CodeQL&logo=github&logoColor=white" alt="CodeQL" /></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" /></a>
    <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma" alt="Prisma" /></a>
    <a href="https://redis.io"><img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" /></a>
    <a href="https://gotenberg.dev"><img src="https://img.shields.io/badge/Engine-Gotenberg%208-009688?style=flat-square" alt="Gotenberg" /></a>
    <a href="https://www.docker.com"><img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" /></a>
    <a href="https://github.com/Skedare240507/FileConvert/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  </p>

</div>

---

## 📋 Table of Contents

- [Highlights](#-highlights)
- [System Architecture](#%EF%B8%8F-system-architecture)
- [Complete Tech Stack](#-complete-tech-stack)
- [Supported Conversions & Engines](#-supported-conversions--engines)
- [Conversion Engine Deep Dive](#-conversion-engine-deep-dive)
- [Repository Structure](#-repository-structure)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Docker Services](#-docker-services)
- [Authentication & Authorization](#-authentication--authorization)
- [Security & Hardening](#%EF%B8%8F-security--hardening)
- [CI/CD Pipeline](#-cicd-pipeline)
- [API Reference](#-api-reference)
- [Background Workers & Job Queue](#-background-workers--job-queue)
- [Payment Integration](#-payment-integration)
- [Monitoring & Observability](#-monitoring--observability)
- [Environment Variable Safety](#-environment-variable-safety)
- [Contributing](#-contributing)
- [License](#-license)

---

## ⚡ Highlights

<table>
  <tr>
    <td width="50%">
      <h3>🚀 Distributed Queue Architecture</h3>
      <p>Decoupled Next.js edge API and background BullMQ workers over Redis. Process 100+ concurrent multi-page conversions with zero HTTP socket timeouts or memory leaks.</p>
    </td>
    <td width="50%">
      <h3>🛡️ Zero-Trust Security & Antivirus</h3>
      <p>Real-time in-stream malware scanning via <strong>ClamAV</strong> before files enter conversion pipelines. Strict magic-byte MIME inspection, IDOR-safe guest tokens, and account lockout protection.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔄 Multi-Engine Fallback Routing</h3>
      <p>Automatic engine selection across <strong>Gotenberg 8</strong> (LibreOffice & Chromium), <strong>pdf2docx</strong> (Python), <strong>ImageMagick</strong>, <strong>PDF-Lib</strong>, <strong>SheetJS</strong>, <strong>Tesseract.js</strong>, and automated <strong>CloudConvert</strong> cloud fallback.</p>
    </td>
    <td width="50%">
      <h3>📦 Direct Storage Streaming</h3>
      <p>Pre-signed cryptographic direct uploads to Backblaze B2 S3-compatible storage. Web servers never buffer user payloads into memory — files stream directly from browser to bucket.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔒 Automated Security Scanning</h3>
      <p>GitHub Actions CI/CD with <strong>Trivy</strong> vulnerability scanner, <strong>CodeQL</strong> SAST analysis, <strong>ESLint</strong> static analysis, TypeScript strict mode, and <strong>npm audit</strong> on every push and pull request.</p>
    </td>
    <td width="50%">
      <h3>⚙️ Enterprise Payment & Plans</h3>
      <p><strong>Razorpay</strong> payment gateway with HMAC-SHA256 signature verification, webhook-driven plan upgrades, and enforced per-plan file/session quotas (Free, Pro, Business tiers).</p>
    </td>
  </tr>
</table>

---

## 🏛️ System Architecture

FileConvert separates presentation from heavy computation using a distributed worker cluster:

```mermaid
flowchart TD
    subgraph Client ["Client Presentation (src/)"]
        UI["Next.js 16 Web Application"]
        SSE["SSE Live Progress Stream"]
    end

    subgraph Gateway ["Reverse Proxy"]
        Nginx["Nginx Alpine<br/>Rate Limiting • Security Headers<br/>WebSocket/SSE Upgrade"]
    end

    subgraph Storage ["Object Storage"]
        S3["Backblaze B2 / Cloudflare R2<br/>(S3-Compatible)"]
    end

    subgraph CoreAPI ["API & Domain Layer (backend/)"]
        API["Next.js Route Handlers (/api)"]
        Guard["Zod Validation + Rate Limiter<br/>+ Magic Byte Verification"]
        Auth["NextAuth.js + JWT Sessions<br/>Google OAuth + Credentials"]
        DB[("PostgreSQL 15+<br/>Prisma ORM 5.22")]
    end

    subgraph Queue ["Message Broker"]
        Redis[("Redis 7 Alpine<br/>Persistent Volume")]
        BullMQ["BullMQ 6 Job Queues<br/>conversion • merge • cleanup"]
    end

    subgraph Workers ["Worker Cluster (backend/workers/)"]
        Orch["Worker Orchestrator<br/>Routing + Retry + Dead Letter"]
        DocW["Document Worker<br/>Gotenberg • pdf2docx • SheetJS"]
        ImgW["Image Worker<br/>ImageMagick • PDF-Lib • JSZip"]
        OcrW["OCR Worker<br/>Tesseract.js"]
        MrgW["Merge Worker<br/>Gotenberg PDF Engine"]
        CleanW["Cleanup Worker<br/>1h TTL File Purge"]
    end

    subgraph Security ["Security Layer"]
        Clam["ClamAV Antivirus Daemon<br/>TCP INSTREAM Protocol"]
    end

    subgraph CICD ["CI/CD Pipeline"]
        GHA["GitHub Actions"]
        Trivy["Trivy Vulnerability Scanner"]
        CodeQL["CodeQL SAST Analysis"]
        ESLintCI["ESLint + TypeScript Check"]
    end

    UI -- HTTPS --> Nginx
    Nginx -- Proxy Pass --> API
    UI -- 1. Direct Presigned Upload --> S3
    UI -- 2. Create Job / Session --> API
    API --> Guard --> Auth --> DB
    API -- 3. Dispatch Job --> BullMQ --> Redis
    BullMQ --> Orch
    Orch -- 4. Scan Payload --> Clam
    Clam -- Clean --> DocW & ImgW & OcrW & MrgW
    DocW & ImgW & OcrW & MrgW -- 5. Write Output --> S3
    DocW & ImgW & OcrW & MrgW -- 6. Update Status --> DB
    SSE -- 7. Real-Time Updates --> UI
    CleanW -- 8. Purge Expired --> S3
    GHA --> Trivy & CodeQL & ESLintCI
```

---

## 💻 Complete Tech Stack

<div align="center">

| Layer | Technologies | Logos |
|:---|:---|:---|
| **Frontend Framework** | Next.js 16 (App Router), React 19, Turbopack | ![Next.js](https://img.shields.io/badge/Next.js-000?style=flat-square&logo=next.js) ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) |
| **Language** | TypeScript 5 (Strict Mode), Vanilla CSS Modules | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS_Modules-1572B6?style=flat-square&logo=css3&logoColor=white) |
| **Authentication** | NextAuth.js v4 (JWT), Google OAuth 2.0, Credentials (bcrypt) | ![NextAuth](https://img.shields.io/badge/NextAuth.js-purple?style=flat-square) ![Google](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white) |
| **Database & ORM** | PostgreSQL 15+, Prisma ORM 5.22 | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white) |
| **Job Queue & Cache** | BullMQ 6, Redis 7 (Alpine), ioredis 6 | ![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=flat-square&logo=redis&logoColor=white) ![BullMQ](https://img.shields.io/badge/BullMQ-E74C3C?style=flat-square) |
| **Object Storage** | Backblaze B2 / Cloudflare R2 (S3-Compatible API), AWS SDK v3 | ![AWS S3](https://img.shields.io/badge/S3_API-569A31?style=flat-square&logo=amazons3&logoColor=white) |
| **Conversion Engines** | Gotenberg 8 (LibreOffice 24), pdf2docx (Python), ImageMagick, Tesseract.js 7, PDF-Lib, SheetJS, CloudConvert | ![LibreOffice](https://img.shields.io/badge/LibreOffice-18A303?style=flat-square&logo=libreoffice&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) |
| **Security** | ClamAV Antivirus, bcryptjs, HMAC-SHA256, Zod 4 Validation, Magic-Byte Verification | ![ClamAV](https://img.shields.io/badge/ClamAV-D22128?style=flat-square) ![Zod](https://img.shields.io/badge/Zod_4-3E67B1?style=flat-square) |
| **Email & Payments** | Nodemailer 10 (SMTP), Razorpay Payment Gateway | ![Nodemailer](https://img.shields.io/badge/Nodemailer-339933?style=flat-square) ![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=flat-square) |
| **Reverse Proxy** | Nginx Alpine (Rate Limiting, Security Headers, WebSocket) | ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white) |
| **Containerization** | Docker, Docker Compose (5 services) | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) |
| **CI/CD** | GitHub Actions (3 workflows) | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) |
| **Static Analysis** | ESLint 9, CodeQL (SAST), Trivy (CVE Scanner), npm audit | ![ESLint](https://img.shields.io/badge/ESLint_9-4B32C3?style=flat-square&logo=eslint&logoColor=white) ![Trivy](https://img.shields.io/badge/Trivy-1904DA?style=flat-square) |
| **Monitoring** | Sentry 10 (Error Tracking & APM), Structured JSON Logger | ![Sentry](https://img.shields.io/badge/Sentry_10-362D59?style=flat-square&logo=sentry&logoColor=white) |
| **Dev Tooling** | Turbopack, tsx, Prisma Studio, Postman | ![Turbopack](https://img.shields.io/badge/Turbopack-000?style=flat-square) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white) |
| **Version Control** | Git, GitHub, Conventional Commits | ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white) |

</div>

---

## 🔄 Supported Conversions & Engines

| Category | Input → Output | Engine Used | Worker | Mode |
|:---|:---|:---|:---|:---|
| **Word → PDF** | `.docx`, `.doc` → `.pdf` | Gotenberg (LibreOffice) | Document | Queued |
| **PDF → Word** | `.pdf` → `.docx`, `.doc` | pdf2docx (Python Microservice) | Document | Queued |
| **PDF → PowerPoint** | `.pdf` → `.pptx` | Gotenberg (LibreOffice) | Document | Queued |
| **Word → PowerPoint** | `.docx` → `.pptx` | Gotenberg (LibreOffice) | Document | Queued |
| **PowerPoint → PDF** | `.pptx`, `.ppt` → `.pdf` | Gotenberg (LibreOffice) | Document | Queued |
| **PowerPoint → Word** | `.pptx` → `.docx` | Gotenberg (LibreOffice) | Document | Queued |
| **Excel → CSV** | `.xlsx`, `.xls` → `.csv` | SheetJS (xlsx) — In-Process | Document | Instant |
| **CSV → Excel** | `.csv` → `.xlsx` | SheetJS (xlsx) — In-Process | Document | Instant |
| **PDF → Images** | `.pdf` → `.jpg` (multi-page ZIP) | ImageMagick + JSZip | Image | Queued |
| **Word → Images** | `.docx` → `.jpg` (ZIP) | Gotenberg → ImageMagick | Image | Queued |
| **PPT → Images** | `.pptx` → `.jpg` (ZIP) | Gotenberg → ImageMagick | Image | Queued |
| **Image → PDF** | `.jpg`, `.png`, `.webp` → `.pdf` | PDF-Lib | Image | Queued |
| **Image → PPT** | `.jpg` → `.pptx` | Gotenberg (HTML → LibreOffice) | Image | Queued |
| **OCR (Scanned PDF)** | Scanned `.pdf` → `.txt` | ImageMagick + Tesseract.js | OCR | Queued |
| **PDF Merge** | Multiple `.pdf` → Single `.pdf` | Gotenberg PDF Engine | Merge | Queued |
| **Word Merge** | Multiple `.docx` → `.pdf` | Gotenberg (LibreOffice) | Merge | Queued |
| **PPT Merge** | Multiple `.pptx` → `.pdf` | Gotenberg (LibreOffice) | Merge | Queued |

> **Fallback Engine**: If Gotenberg is unreachable (container crash), the system automatically attempts conversion via **CloudConvert** cloud API (25 free conversions/day). This acts as a circuit breaker, not a routine path.

---

## 🔧 Conversion Engine Deep Dive

### 1. Gotenberg 8 (Primary Engine)
![Gotenberg](https://img.shields.io/badge/Gotenberg_8-009688?style=for-the-badge)

- **What it is**: Docker-based HTTP API that wraps **LibreOffice 24** and **Chromium** for high-fidelity document conversion.
- **Used for**: Word/PPT/Excel → PDF, PDF → PPT, inter-format conversions, PDF merging (via `pdfengines/merge`).
- **Configuration**: JavaScript in Gotenberg is disabled (`--chromium-disable-javascript=true`) to prevent XSS during HTML → PDF rendering. File access is restricted to `/tmp/.*` only.
- **Timeout**: 120s per conversion, 180s for merge operations.
- **PDF Output**: PDF/A-2b archival format for long-term compliance.

### 2. pdf2docx (Python Microservice)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)

- **What it is**: Custom FastAPI microservice running inside its own Docker container (`pdf-converter/`).
- **Why it exists**: LibreOffice/Gotenberg produces **structurally broken** DOCX files from PDFs (uses Draw/Impress internally). pdf2docx analyses the PDF's internal layout (text blocks, images, tables, styles) and reconstructs a proper Word document that Microsoft Word can natively open.
- **Stack**: Python 3.11-slim, FastAPI, Uvicorn, pdf2docx library, python-multipart.
- **Endpoint**: `POST /convert/pdf-to-docx` (multipart/form-data).

### 3. ImageMagick
![ImageMagick](https://img.shields.io/badge/ImageMagick-000?style=for-the-badge)

- **Used for**: PDF page rasterization to JPEG images, scanned PDF → PNG (pre-OCR step).
- **How**: `magick -density <DPI> input.pdf output_%03d.jpg` for multi-page documents.
- **DPI Options**: 150 DPI (fast, default) or 300 DPI (high-quality, user-selectable).
- **Output**: Multi-page PDFs produce a ZIP archive of individual page images via JSZip.

### 4. Tesseract.js 7 (OCR Engine)
![Tesseract](https://img.shields.io/badge/Tesseract.js_7-3F51B5?style=for-the-badge)

- **Used for**: Extracting searchable text from scanned PDFs and images.
- **Flow**: PDF → ImageMagick (300 DPI PNG per page) → Tesseract.js (English language pack) → Concatenated text output.
- **Worker Management**: Tesseract workers are created and terminated per-job to prevent memory leaks.

### 5. PDF-Lib
![PDF-Lib](https://img.shields.io/badge/PDF--Lib-E53935?style=for-the-badge)

- **Used for**: Image → PDF conversion (embedding JPEG/PNG into PDF pages with native dimensions).
- **How**: Detects image format via magic bytes (PNG: `0x89504E47`, JPEG: `0xFFD8FF`), embeds at full resolution, creates a page sized exactly to the image dimensions.

### 6. SheetJS (xlsx)
![SheetJS](https://img.shields.io/badge/SheetJS-217346?style=for-the-badge)

- **Used for**: Excel ↔ CSV conversions.
- **Mode**: Runs entirely in-process (no external service needed). Lightweight and instant.
- **Export**: CSV uses standard comma delimiters with CRLF line endings. Excel export creates a properly formatted `.xlsx` workbook.

### 7. CloudConvert (Emergency Fallback)
![CloudConvert](https://img.shields.io/badge/CloudConvert-FF8A00?style=for-the-badge)

- **Used for**: Any conversion when Gotenberg is completely unreachable.
- **Limit**: 25 free conversions/day — strictly an emergency circuit breaker.
- **Safety**: Throws if `CLOUDCONVERT_API_KEY` is not configured. Cannot accidentally be triggered in development.

---

## 📁 Repository Structure

```
fileconvert/
├── src/                                  # ── PRESENTATION LAYER (Next.js 16) ──
│   ├── app/                              # Next.js App Router
│   │   ├── login/                        # Email/password + Google OAuth sign-in
│   │   ├── signup/                       # New account registration with OTP
│   │   ├── forgot-password/              # Password recovery flow
│   │   ├── reset-password/               # Secure password reset page
│   │   ├── admin/                        # Admin dashboard (analytics, queue metrics)
│   │   ├── dashboard/                    # User conversion history & active downloads
│   │   ├── profile/                      # Account settings & plan management
│   │   ├── convert/                      # 19 dedicated conversion tool pages
│   │   │   ├── pdf-to-word/              # PDF → DOCX/DOC
│   │   │   ├── word-to-pdf/              # DOCX → PDF
│   │   │   ├── pdf-to-jpg/               # PDF → JPG (multi-page ZIP)
│   │   │   ├── jpg-to-pdf/               # JPG → PDF
│   │   │   ├── pdf-to-ppt/              # PDF → PPTX
│   │   │   ├── ppt-to-pdf/              # PPTX → PDF
│   │   │   ├── word-to-ppt/             # DOCX → PPTX
│   │   │   ├── ppt-to-word/             # PPTX → DOCX
│   │   │   ├── excel-to-csv/            # XLSX → CSV
│   │   │   ├── csv-to-excel/            # CSV → XLSX
│   │   │   ├── word-to-jpg/             # DOCX → JPG (ZIP)
│   │   │   ├── ppt-to-jpg/              # PPTX → JPG (ZIP)
│   │   │   ├── jpg-to-ppt/              # JPG → PPTX
│   │   │   ├── merge/                   # PDF/Word/PPT merge studio
│   │   │   └── ...                      # Category landing pages (pdf/, word/, ppt/, etc.)
│   │   ├── api/                          # REST API & SSE endpoints
│   │   │   ├── auth/[...nextauth]/       # NextAuth handler (Google + Credentials)
│   │   │   ├── auth/signup/              # Registration with OTP verification
│   │   │   ├── auth/otp/                 # OTP generation & verification
│   │   │   ├── auth/reset-password/      # Password reset with OTP
│   │   │   ├── convert/upload/init       # Pre-signed upload URL generation
│   │   │   ├── convert/jobs/             # Job creation & status
│   │   │   ├── convert/jobs/[id]/live    # SSE real-time progress stream
│   │   │   ├── convert/jobs/[id]/download # Signed download URL
│   │   │   ├── merge/                    # Merge session management
│   │   │   ├── feedback/                 # User feedback submission
│   │   │   └── admin/                    # Queue inspection (admin only)
│   │   ├── help/                         # Help & FAQ pages
│   │   ├── privacy/                      # Privacy policy
│   │   ├── layout.tsx                    # Root layout (HTML shell, fonts, providers)
│   │   ├── page.tsx                      # Landing page & hero
│   │   ├── robots.ts                     # SEO robots.txt
│   │   └── sitemap.ts                    # SEO XML sitemap
│   ├── components/                       # Reusable React 19 UI (Header, Modals)
│   ├── hooks/                            # Custom hooks (useConverter — SSE streaming)
│   └── types/                            # Frontend TypeScript types & NextAuth extensions
│
├── backend/                              # ── CORE DOMAIN & ENGINE (Isolated) ──
│   ├── config/
│   │   ├── env.ts                        # Fail-fast env validation (throws on missing vars)
│   │   └── constants.ts                  # MIME registries, plan quotas, TTLs, queue names
│   ├── db/
│   │   ├── client.ts                     # Prisma client singleton
│   │   └── queries/                      # Typed queries (users, jobs, sessions, feedback)
│   ├── middleware/
│   │   ├── withAuth.ts                   # Session + plan resolution guard
│   │   ├── withAdminAuth.ts              # Zero-trust admin guard (returns 404 to non-admins)
│   │   └── withRateLimit.ts              # Redis sliding-window rate limiter
│   ├── queue/
│   │   ├── client.ts                     # Redis connection provider (ioredis)
│   │   ├── queues.ts                     # Queue registries (conversion, merge, cleanup)
│   │   └── jobs/                         # Job payload type definitions
│   ├── services/
│   │   ├── conversion/
│   │   │   ├── gotenberg.ts              # Gotenberg HTTP client (convert + merge)
│   │   │   ├── pdf2docx.ts               # Python microservice client (PDF → DOCX)
│   │   │   ├── sheetjs.ts               # SheetJS Excel ↔ CSV (in-process)
│   │   │   ├── imagemagick.ts            # ImageMagick wrapper
│   │   │   └── fallback.ts              # CloudConvert emergency fallback
│   │   ├── email/mailer.ts               # Nodemailer SMTP (OTP, security alerts)
│   │   ├── payment/razorpay.ts           # Razorpay orders, HMAC verification, webhooks
│   │   ├── scan/clamav.ts                # ClamAV TCP INSTREAM antivirus scanner
│   │   └── storage/storage.ts            # B2/R2 S3 client (upload, download, signed URLs)
│   ├── utils/
│   │   ├── fileType.ts                   # Magic-byte file identification
│   │   ├── logger.ts                     # Structured logger + Sentry reporter
│   │   ├── sanitize.ts                   # Path-traversal filename sanitizer
│   │   ├── planLimits.ts                 # Plan tier enforcement helpers
│   │   └── tenantSecurity.ts             # IDOR protection & guest session validation
│   ├── validation/
│   │   ├── upload.ts                     # Zod upload schema + magic-byte verifier
│   │   ├── conversion.ts                 # Zod conversion job schema
│   │   ├── merge.ts                      # Zod merge session schema
│   │   └── payment.ts                    # Zod payment & webhook schemas
│   └── workers/
│       ├── orchestrator.ts               # Master daemon: routes jobs to workers
│       ├── documentWorker.ts             # Gotenberg/pdf2docx/SheetJS processor
│       ├── imageWorker.ts                # ImageMagick/PDF-Lib/JSZip processor
│       ├── ocrWorker.ts                  # Tesseract.js OCR processor
│       ├── mergeWorker.ts                # File merge processor
│       └── cleanupWorker.ts              # Scheduled 1-hour TTL file purger
│
├── pdf-converter/                        # Python Microservice (PDF → DOCX)
│   ├── main.py                           # FastAPI server (pdf2docx)
│   └── Dockerfile                        # Python 3.11-slim + pdf2docx + Uvicorn
│
├── prisma/
│   └── schema.prisma                     # PostgreSQL schema (Users, Jobs, OTPs, Accounts)
│
├── nginx/
│   └── nginx.conf                        # Production reverse proxy (rate limits, headers)
│
├── .github/workflows/
│   ├── ci.yml                            # Build + Lint + Typecheck + Audit + Trivy
│   └── codeql.yml                        # GitHub CodeQL SAST analysis
│
├── docker-compose.yml                    # 5-service local development stack
├── eslint.config.mjs                     # ESLint 9 flat config
├── next.config.mjs                       # Next.js + Turbopack configuration
├── tsconfig.json                         # TypeScript strict mode + path aliases
└── package.json                          # Dependencies & scripts
```

---

## 🚀 Quick Start

### 1. Prerequisites

| Tool | Version | Purpose |
|:---|:---|:---|
| **Node.js** | `v20.x` or `v22.x` (LTS) | Runtime for Next.js & workers |
| **Docker & Docker Compose** | Latest | Container orchestration |
| **PostgreSQL** | 15+ | Primary database |
| **Git** | Latest | Version control |

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Skedare240507/FileConvert.git
cd FileConvert

# Install dependencies
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials (see Environment Configuration section below)
```

### 4. Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate typed Prisma client
npx prisma generate
```

### 5. Launch Docker Services

```bash
# Start all 5 support containers
docker compose up -d

# Verify all services are healthy
docker compose ps
```

### 6. Start Development Servers

**Terminal 1 — Frontend:**
```bash
npm run dev        # Next.js 16 + Turbopack on port 3000
```

**Terminal 2 — Background Workers:**
```bash
npm run worker     # BullMQ orchestrator + all workers
```

Navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Environment Configuration

All environment variables are **validated at startup** via `backend/config/env.ts`. Missing required variables cause an immediate crash with a clear error message — misconfigurations are caught before the first request, not during runtime.

<details>
<summary><strong>📋 Complete Environment Variables Reference</strong></summary>

```env
# ═══════════════════════════════════════════════════════════════════
# DATABASE (Required)
# ═══════════════════════════════════════════════════════════════════
DATABASE_URL="postgresql://postgres:password@localhost:5432/fileconvert?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/fileconvert?schema=public"

# ═══════════════════════════════════════════════════════════════════
# NEXTAUTH (Required)
# ═══════════════════════════════════════════════════════════════════
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-32-byte-hex-secret"   # openssl rand -hex 32

# ═══════════════════════════════════════════════════════════════════
# GOOGLE OAUTH (Required)
# ═══════════════════════════════════════════════════════════════════
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# ═══════════════════════════════════════════════════════════════════
# OBJECT STORAGE — Backblaze B2 / S3-Compatible (Required)
# ═══════════════════════════════════════════════════════════════════
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"
B2_REGION="us-east-005"
B2_ACCESS_KEY_ID="your-key-id"
B2_SECRET_ACCESS_KEY="your-secret-key"
B2_BUCKET="fileconvert-storage"

# ═══════════════════════════════════════════════════════════════════
# REDIS (Required)
# ═══════════════════════════════════════════════════════════════════
REDIS_URL="redis://127.0.0.1:6379"

# ═══════════════════════════════════════════════════════════════════
# DOCKER SERVICES (Optional — defaults provided)
# ═══════════════════════════════════════════════════════════════════
GOTENBERG_URL="http://127.0.0.1:3001"
PDF_CONVERTER_URL="http://127.0.0.1:8080"
CLAMAV_HOST="127.0.0.1"
CLAMAV_PORT="3310"

# ═══════════════════════════════════════════════════════════════════
# ADMIN ACCESS (Optional — comma-separated email whitelist)
# ═══════════════════════════════════════════════════════════════════
ADMIN_EMAILS="admin@example.com"

# ═══════════════════════════════════════════════════════════════════
# EMAIL — SMTP (Optional)
# ═══════════════════════════════════════════════════════════════════
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="notifications@fileconvert.app"
SMTP_PASS="your-app-password"
SMTP_FROM="FileConvert <noreply@fileconvert.app>"

# ═══════════════════════════════════════════════════════════════════
# PAYMENTS — Razorpay (Optional)
# ═══════════════════════════════════════════════════════════════════
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""

# ═══════════════════════════════════════════════════════════════════
# MONITORING (Optional)
# ═══════════════════════════════════════════════════════════════════
SENTRY_DSN=""

# ═══════════════════════════════════════════════════════════════════
# CLOUD FALLBACK (Optional — emergency only)
# ═══════════════════════════════════════════════════════════════════
CLOUDCONVERT_API_KEY=""
```

</details>

> **⚠️ Security**: The `.env` file is listed in `.gitignore` and is **never committed** to version control. All secrets are server-side only — see [Environment Variable Safety](#-environment-variable-safety).

---

## 🐳 Docker Services

FileConvert runs **5 containerized services** via Docker Compose:

| Service | Image | Port | Purpose | Health Check |
|:---|:---|:---|:---|:---|
| **Redis** | `redis:7-alpine` | `127.0.0.1:6379` | Job queue broker + rate limiter cache | `redis-cli ping` |
| **Gotenberg** | `gotenberg/gotenberg:8` | `127.0.0.1:3001` | LibreOffice/Chromium document conversion | `curl /health` |
| **ClamAV** | `clamav/clamav:stable` | `127.0.0.1:3310` | Real-time antivirus scanning daemon | `clamdcheck.sh` |
| **PDF Converter** | Custom (Python 3.11) | `127.0.0.1:8080` | pdf2docx microservice (PDF → Word) | `urllib /health` |
| **Nginx** | `nginx:alpine` | `80` | Reverse proxy + rate limiting + security headers | — |

All ports are bound to `127.0.0.1` to prevent external network exposure. Each service has a health check configured with automatic restart (`unless-stopped` policy).

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f gotenberg

# Stop all services
docker compose down
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

FileConvert supports **two authentication methods**, both managed by **NextAuth.js v4** with JWT session strategy:

```mermaid
flowchart LR
    subgraph Methods ["Authentication Methods"]
        Google["Google OAuth 2.0<br/>One-click sign-in"]
        Email["Email + Password<br/>+ OTP Verification"]
    end

    subgraph Security ["Security Checks"]
        Lock["Account Lockout<br/>5 failed attempts → 30min lock"]
        Alert["Email Alert<br/>Suspicious login notification"]
        OTP["OTP Verification<br/>6-digit code, 10min expiry"]
        Hash["Password Hashing<br/>bcryptjs (salt rounds)"]
    end

    subgraph Session ["Session Management"]
        JWT["JWT Token<br/>Signed with NEXTAUTH_SECRET"]
        DB["Database Lookup<br/>Real-time plan resolution"]
    end

    Google --> JWT
    Email --> Hash --> Lock --> JWT
    Lock -- "≥5 failures" --> Alert
    Email -- "New signup" --> OTP --> JWT
    JWT --> DB
```

#### Google OAuth 2.0
- Provider: Google Cloud Console OAuth application.
- `allowDangerousEmailAccountLinking: false` — prevents account takeover via email linking.
- `prompt: 'select_account'` — always shows the account picker.
- `access_type: 'offline'` — provides refresh tokens for persistent sessions.

#### Email + Password (Credentials)
- Passwords are hashed with **bcryptjs** before storage.
- New accounts require **OTP verification** (6-digit code sent via SMTP, expires in 10 minutes).
- OTPs are stored in a dedicated `otps` table with `email + code` compound index.

### Brute-Force Protection & Account Lockout

| Metric | Value |
|:---|:---|
| **Max failed login attempts** | 5 |
| **Lockout duration** | 30 minutes |
| **Security email alert** | Sent on 5th failed attempt |
| **Counter reset** | On successful login |

When a user fails 5 consecutive login attempts:
1. Account is locked for 30 minutes (`lockedUntil` timestamp in DB).
2. An **HTML security alert email** is sent to the user's registered address warning of suspicious activity.
3. Locked accounts return `"Account is temporarily locked. Please try again later."`.
4. Successful login resets the counter and clears the lock.

### Authorization Layers

| Middleware | File | Purpose |
|:---|:---|:---|
| `withAuth` | `middleware/withAuth.ts` | Validates JWT session, resolves current plan from DB, returns 401 if unauthenticated |
| `withAdminAuth` | `middleware/withAdminAuth.ts` | **Zero-Trust Admin Guard** — verifies DB role + email whitelist, returns **404** (not 403) to non-admins to cloak admin routes |
| `withRateLimit` | `middleware/withRateLimit.ts` | Redis sliding-window rate limiter, extracts real IP from `X-Real-IP` header (set by Nginx) |

#### Admin Route Cloaking (Zero-Trust)

Admin endpoints **do not return 401 or 403** — they return **404 Not Found**. This prevents attackers from confirming the existence of admin API routes through error code enumeration.

Admin access requires **all three** of:
1. Valid authenticated session
2. `role === 'admin'` in the database
3. Email in the `ADMIN_EMAILS` environment variable whitelist

Even if an admin's session is compromised, the DB role can be revoked independently.

---

## 🛡️ Security & Hardening

### Defense-in-Depth Overview

```mermaid
flowchart TD
    Upload["User Upload"] --> Nginx
    
    subgraph Layer1 ["Layer 1: Network"]
        Nginx["Nginx Reverse Proxy<br/>• Rate limit: 10 req/s per IP<br/>• Burst: 20 requests<br/>• Security headers<br/>• Max body: 50MB"]
    end

    subgraph Layer2 ["Layer 2: Application"]
        Rate["Redis Rate Limiter<br/>• Sliding window per IP<br/>• Custom limits per endpoint"]
        Validation["Zod Schema Validation<br/>• Input sanitization<br/>• Type coercion"]
        Magic["Magic Byte Verification<br/>• PDF: %PDF<br/>• ZIP/OOXML: PK\\x03\\x04<br/>• JPEG: FF D8 FF<br/>• PNG: 89 50 4E 47"]
        Sanitize["Filename Sanitizer<br/>• Path traversal prevention<br/>• Shell injection prevention<br/>• 200 char max length"]
    end

    subgraph Layer3 ["Layer 3: Antivirus"]
        ClamAV["ClamAV Daemon<br/>• TCP INSTREAM protocol<br/>• 8KB chunk scanning<br/>• Auto-updating signatures"]
    end

    subgraph Layer4 ["Layer 4: Access Control"]
        Auth["JWT Authentication"]
        IDOR["IDOR Protection<br/>• Tenant ownership checks<br/>• anon_token for guests<br/>• Resource-level ACL"]
        Admin["Admin Cloaking<br/>• Returns 404 to non-admins<br/>• DB role + email whitelist"]
    end

    subgraph Layer5 ["Layer 5: Data"]
        TTL["1-Hour Auto-Deletion<br/>• cleanupWorker.ts<br/>• 15-minute sweep interval"]
        Signed["Signed URLs<br/>• 5-minute expiry<br/>• Cryptographic validation"]
        Encrypt["Password Hashing<br/>• bcryptjs"]
    end

    Nginx --> Rate --> Validation --> Magic --> Sanitize
    Sanitize --> ClamAV
    ClamAV -- "Clean" --> Auth --> IDOR --> Admin
    ClamAV -- "Infected" --> Destroy["File Destroyed"]
    Admin --> TTL --> Signed
```

### Security Measures Checklist

#### 🌐 Network Security
| Measure | Implementation | File |
|:---|:---|:---|
| **Reverse Proxy** | Nginx Alpine with IP-based rate limiting (10 req/s, burst 20) | `nginx/nginx.conf` |
| **DDoS Mitigation** | Dual-layer rate limiting (Nginx + Redis sliding window) | `nginx.conf` + `withRateLimit.ts` |
| **Port Binding** | All Docker ports bound to `127.0.0.1` (localhost only) | `docker-compose.yml` |
| **Server Fingerprint Removal** | `server_tokens off` (Nginx) + `poweredByHeader: false` (Next.js) | `nginx.conf` + `next.config.mjs` |

#### 🔒 HTTP Security Headers
All responses include these defense-in-depth headers via Nginx:

| Header | Value | Protection |
|:---|:---|:---|
| `X-Frame-Options` | `DENY` | Clickjacking prevention |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |
| `X-XSS-Protection` | `1; mode=block` | XSS filter enforcement |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage prevention |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Feature restriction |

#### 🦠 Anti-Malware (ClamAV)
- **Every uploaded file** passes through ClamAV before any worker processes it.
- Scanning uses the TCP **INSTREAM** protocol — files are streamed in 8KB chunks directly to the daemon socket (no temp files).
- Scan results: `clean` → proceed, `infected` → file destroyed + job failed, `error` → upload rejected (fail-safe).
- ClamAV auto-updates its virus signature database (`CLAMAV_NO_FRESHCLAM: false`).
- DNS configured to `8.8.8.8` and `1.1.1.1` for reliable signature updates.

#### 📝 Input Validation & Sanitization
| Validation | Details |
|:---|:---|
| **Zod Schemas** | All API inputs validated with Zod 4 schemas (conversion, merge, upload, payment) |
| **MIME Type Check** | Whitelist of 10 allowed MIME types (`ALLOWED_MIME_TYPES`) |
| **Magic Byte Verification** | File headers checked against known signatures — renaming `.exe` to `.pdf` doesn't work |
| **Filename Sanitization** | Strips directory components, removes `..` traversal, allows only `[a-zA-Z0-9._-]`, strips leading dots, enforces 200-char max |
| **File Size Enforcement** | Server-side max 50 MB (`MAX_FILE_SIZE_BYTES`), Nginx max 50 MB (`client_max_body_size`) |

#### 🔑 Authentication Security
| Measure | Details |
|:---|:---|
| **Password Hashing** | bcryptjs with automatic salt generation |
| **Account Lockout** | 5 failed attempts → 30-minute lock + security email alert |
| **OTP Expiry** | 6-digit codes expire after 10 minutes |
| **JWT Signing** | HMAC-signed with `NEXTAUTH_SECRET` (32-byte hex) |
| **OAuth Safety** | `allowDangerousEmailAccountLinking: false` prevents account takeover |

#### 🛡️ Access Control & Anti-IDOR
| Measure | Details |
|:---|:---|
| **Multi-Tenant Ownership** | Every resource has `user_id` or `anon_token` — verified on every access |
| **Anonymous Sessions** | Guest conversions use cryptographically generated `anon_token` (httpOnly cookie) |
| **Admin Route Cloaking** | Non-admins receive 404 (not 401/403) — admin endpoint existence is hidden |
| **Resource-Level ACL** | `canAccessResource()` checks owner match before serving downloads |

#### 💳 Payment Security
| Measure | Details |
|:---|:---|
| **HMAC-SHA256 Verification** | Razorpay payment signatures verified server-side with `timingSafeEqual` |
| **Timing Attack Prevention** | `crypto.timingSafeEqual` prevents HMAC comparison timing side-channels |
| **Webhook Validation** | `X-Razorpay-Signature` header verified on every webhook event |
| **Server-Side Only** | Payment verification NEVER trusts client assertions |

#### 📦 Data Lifecycle
| Measure | Details |
|:---|:---|
| **1-Hour TTL** | All uploaded and converted files auto-deleted after 60 minutes |
| **Cleanup Worker** | Runs every 15 minutes, queries DB for expired files, enqueues deletion jobs |
| **Signed Download URLs** | 5-minute expiry on download links (cryptographically signed via AWS SDK) |
| **Idempotent Cleanup** | R2 keys nulled in DB after cleanup to prevent duplicate deletions |

#### 🚫 Anti-Phishing Email Protection
- Security alert emails use a **branded HTML template** with clear "FileConvert Security" branding.
- Alerts are triggered only on 5 failed login attempts — not on every failure (prevents alert fatigue phishing).
- Email contains specific, actionable advice: wait 30 minutes or reset password.
- No clickable links in security emails that could be spoofed — users must navigate to the site manually.
- `SMTP_FROM` is configurable for custom domain alignment (SPF/DKIM).

---

## 🔄 CI/CD Pipeline

FileConvert uses **GitHub Actions** with two workflow files that run on every push and pull request to `main`:

### Pipeline 1: CI Pipeline (`ci.yml`)

```mermaid
flowchart LR
    Push["Push / PR to main"] --> Checkout
    
    subgraph BuildTest ["build-and-test"]
        Checkout["Checkout Code"] --> Setup["Setup Node.js 20"]
        Setup --> Install["npm ci"]
        Install --> Prisma["prisma generate"]
        Prisma --> Lint["ESLint Check"]
        Lint --> TypeCheck["tsc --noEmit"]
        TypeCheck --> Audit["npm audit<br/>(--audit-level=high)"]
    end

    subgraph SecurityScan ["security-scan"]
        Checkout2["Checkout Code"] --> Trivy["Trivy Scanner<br/>CRITICAL + HIGH<br/>File System Mode"]
    end

    Push --> Checkout2
```

| Step | Tool | Purpose |
|:---|:---|:---|
| **Dependency Install** | `npm ci --legacy-peer-deps` | Clean install from lockfile |
| **Schema Generation** | `npx prisma generate` | Generate typed DB client |
| **Linting** | ESLint 9 (flat config) | Code quality & Next.js best practices |
| **Type Checking** | `tsc --noEmit` | TypeScript strict mode compliance |
| **Dependency Audit** | `npm audit --audit-level=high` | Known CVE detection in dependencies |
| **Vulnerability Scan** | Trivy (Aqua Security) | CRITICAL + HIGH CVE scan of entire repo |

### Pipeline 2: CodeQL SAST (`codeql.yml`)

| Aspect | Details |
|:---|:---|
| **Trigger** | Push, PR, scheduled (Monday 6:28 UTC) |
| **Language** | JavaScript/TypeScript |
| **Analysis** | GitHub CodeQL Semantic Analysis |
| **Purpose** | Detect SQL injection, XSS, prototype pollution, path traversal, unsafe deserialization |
| **Permissions** | `security-events: write`, `actions: read`, `contents: read` |

### ESLint Configuration

ESLint 9 with flat config (`eslint.config.mjs`):

```
Extends: next/core-web-vitals
Ignores: .next/, node_modules/, dist/, build/, public/
```

### Security Tools Summary

| Tool | Type | Trigger | What It Catches |
|:---|:---|:---|:---|
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) | Static Analysis | Every push/PR | Code quality, React best practices, unused vars |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Type Safety | Every push/PR | Type errors, strict null checks, missing imports |
| ![Trivy](https://img.shields.io/badge/Trivy-1904DA?style=flat-square) | CVE Scanner | Every push/PR | Known vulnerabilities in deps & Docker images |
| ![CodeQL](https://img.shields.io/badge/CodeQL-000?style=flat-square&logo=github) | SAST | Push/PR/Weekly | Injection flaws, XSS, prototype pollution |
| ![npm audit](https://img.shields.io/badge/npm_audit-CB3837?style=flat-square&logo=npm&logoColor=white) | Dependency Audit | Every push/PR | Known CVEs in npm packages |
| ![ClamAV](https://img.shields.io/badge/ClamAV-D22128?style=flat-square) | Antivirus | Runtime | Malware in uploaded files |

---

## 📡 API Reference

### 1. Upload & Conversion

#### Initialize Direct Upload
```http
POST /api/convert/upload/init
Content-Type: application/json

{
  "filename": "quarterly-report.docx",
  "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "fileSizeBytes": 2048576,
  "sourceType": "docx",
  "targetType": "pdf"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "uploadUrl": "https://s3.us-east-005.backblazeb2.com/fileconvert-storage/uploads/...",
  "r2Key": "uploads/<userId>/1695312000000-quarterly-report.docx",
  "anonToken": "c4ca4238a0b923820dcc509a6f75849b"
}
```

#### Create Conversion Job
```http
POST /api/convert/jobs
Content-Type: application/json
Authorization: Bearer <session-cookie>

{
  "r2InputKey": "uploads/<userId>/1695312000000-quarterly-report.docx",
  "sourceType": "docx",
  "targetType": "pdf",
  "fileCount": 1,
  "dpi": "150"
}
```

**Response (`201 Created`)**:
```json
{
  "jobId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status": "queued",
  "workerType": "document",
  "engineUsed": "gotenberg"
}
```

### 2. Real-Time Job Progress (SSE)
```http
GET /api/convert/jobs/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/live?token=c4ca4238a0b923820dcc509a6f75849b
Accept: text/event-stream
```

**Event Stream**:
```
event: status
data: {"status": "scanning", "progress": 25}

event: status
data: {"status": "processing", "progress": 70, "engine": "gotenberg"}

event: status
data: {"status": "completed", "progress": 100, "downloadUrl": "/api/convert/jobs/.../download"}
```

### 3. Download Converted File
```http
GET /api/convert/jobs/<jobId>/download?token=<anonToken>
```

Returns a **302 redirect** to a 5-minute signed B2 download URL.

### 4. Merge Files
```http
POST /api/merge
Content-Type: application/json

{
  "fileType": "pdf",
  "r2InputKeys": [
    "uploads/<userId>/file1.pdf",
    "uploads/<userId>/file2.pdf"
  ]
}
```

### 5. Submit Feedback
```http
POST /api/feedback
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Great tool!",
  "category": "feature"
}
```

### 6. Authentication

| Endpoint | Method | Purpose |
|:---|:---|:---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js handler (Google + Credentials) |
| `/api/auth/signup` | POST | New user registration |
| `/api/auth/otp` | POST | OTP generation & verification |
| `/api/auth/reset-password` | POST | Password reset with OTP |

### 7. Admin Endpoints

| Endpoint | Method | Purpose | Guard |
|:---|:---|:---|:---|
| `/api/admin/queue` | GET | Queue metrics & job counts | `withAdminAuth` (returns 404 to non-admins) |
| `/api/admin/users` | GET | User list & plan distribution | `withAdminAuth` |

---

## ⚙️ Background Workers & Job Queue

### Queue Architecture

FileConvert uses **BullMQ 6** backed by **Redis 7** for reliable job processing:

| Queue Name | Purpose | Concurrency | Retry Strategy |
|:---|:---|:---|:---|
| `conversion` | Document/image/OCR conversions | 5 workers | 3 retries: 5s → 30s → 2min (exponential) |
| `merge` | File merge operations | 2 workers | Default BullMQ retry |
| `file-cleanup` | Expired file deletion from B2 | 2 workers | Default BullMQ retry |

### Worker Routing

The **Orchestrator** (`orchestrator.ts`) acts as the master daemon:

```
Job Received → Read workerType → Route to correct processor

workerType: "document" → documentWorker.ts
workerType: "image"    → imageWorker.ts
workerType: "ocr"      → ocrWorker.ts
```

### Job Lifecycle

```mermaid
stateDiagram-v2
    [*] --> queued: Job Created
    queued --> scanning: ClamAV Scan
    scanning --> processing: File Clean
    scanning --> failed: Infected / Error
    processing --> completed: Conversion Success
    processing --> failed: Conversion Error
    failed --> queued: Retry (≤ 3)
    failed --> dead_letter: Max Retries Exhausted
    completed --> [*]
    dead_letter --> [*]
```

### Dead Letter Queue

Jobs that fail **3 consecutive times** are moved to `dead_letter` status with the full error history. This prevents infinite retry loops while preserving the failure context for debugging.

### Cleanup Scheduler

- Runs every **15 minutes** (via `setInterval` in the orchestrator).
- Queries DB for conversion jobs and merge sessions older than **1 hour**.
- Enqueues cleanup jobs to delete R2 objects (input + output files).
- Nulls R2 keys in the database to prevent duplicate cleanup attempts.

---

## 💳 Payment Integration

### Razorpay Gateway

| Plan | Price | Features |
|:---|:---|:---|
| **Free** | ₹0 | 2 files/session, no merge, basic conversions |
| **Pro** | ₹89/mo | 10 files/session, 10 merge sessions/day |
| **Business** | ₹150/mo | Unlimited files, unlimited merges |

### Payment Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Razorpay
    
    User->>Frontend: Select Plan
    Frontend->>API: POST /api/payment/create-order
    API->>Razorpay: Create Order (amount, currency)
    Razorpay-->>API: Order ID
    API-->>Frontend: Order details
    Frontend->>Razorpay: Open Razorpay Checkout
    User->>Razorpay: Complete Payment
    Razorpay-->>Frontend: Payment ID + Signature
    Frontend->>API: POST /api/payment/verify
    API->>API: HMAC-SHA256 verification (timingSafeEqual)
    API->>API: Update user plan in DB
    API-->>Frontend: Success
```

### Security
- Payment signature verification uses `crypto.timingSafeEqual()` to prevent timing attacks.
- Webhook signatures (`X-Razorpay-Signature`) are verified with a separate webhook secret.
- All payment logic is **server-side only** — the client never sees the key secret.

---

## 📊 Monitoring & Observability

### Sentry Integration
- **Package**: `@sentry/nextjs` v10.
- **Dev Mode**: Errors logged to console only (Sentry not loaded).
- **Production**: Errors forwarded via `captureException()` / `captureMessage()`.
- **Structured Logging**: All logs include ISO timestamps, severity levels, and contextual metadata.

### Log Format
```
[INFO]  2026-09-21T13:30:00.000Z — [DocumentWorker] Processing docx:pdf for job abc123
[WARN]  2026-09-21T13:30:05.000Z — [CloudConvert] Using emergency fallback: docx → pdf
[ERROR] 2026-09-21T13:30:10.000Z — [Orchestrator] Job abc123 failed (attempt 2): Gotenberg error 500
```

---

## 🔐 Environment Variable Safety

### How Secrets Are Protected

| Protection | Details |
|:---|:---|
| **`.gitignore`** | `.env` is excluded from version control |
| **Server-Side Only** | All sensitive env vars (`DATABASE_URL`, `NEXTAUTH_SECRET`, API keys) are accessed only in `backend/config/env.ts` — never imported in client components |
| **Build-Time Validation** | `env.ts` throws immediately if a required variable is missing at startup |
| **No `NEXT_PUBLIC_` Prefix** | Sensitive variables do NOT use the `NEXT_PUBLIC_` prefix, ensuring Next.js never bundles them into client JavaScript |
| **Docker Port Binding** | All service ports bound to `127.0.0.1` — not accessible from external networks |
| **CI/CD Secrets** | GitHub Actions secrets are configured in repository settings, never hardcoded in workflow files |
| **OAuth Client Secret** | `GOOGLE_CLIENT_SECRET` is server-side only — the client only sees the Client ID during the OAuth redirect |
| **Payment Keys** | `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` never leave the server |

### What the Frontend Can Access
Only these non-sensitive values are available client-side:
- `NEXTAUTH_URL` — the app's public URL (needed for OAuth redirects)
- `GOOGLE_CLIENT_ID` — public OAuth client identifier (non-secret by design)

### What the Frontend CANNOT Access
- Database connection strings
- API keys (Razorpay, CloudConvert, B2, Sentry)
- SMTP credentials
- NextAuth secret
- Admin email list
- Redis connection URL

---

## 🗄️ Database Schema

The PostgreSQL schema (via Prisma) contains 5 models:

| Model | Purpose | Key Fields |
|:---|:---|:---|
| **User** | Registered accounts | `email`, `password` (hashed), `role` (user/admin), `plan` (free/pro/business), `failedLoginAttempts`, `lockedUntil` |
| **Account** | OAuth provider links (NextAuth) | `provider`, `providerAccountId`, `access_token`, `refresh_token` |
| **ConversionJob** | File conversion records | `source_type`, `target_type`, `status`, `worker_type`, `engine_used`, `clam_scan_result`, `r2_input_key`, `r2_output_key`, `retry_count` |
| **MergeSession** | File merge records | `file_type`, `file_count`, `status`, `r2_output_key` |
| **Feedback** | User feedback submissions | `name`, `email`, `message`, `category` (bug/feature/billing/other), `status` |
| **Otp** | One-time passwords | `email`, `code`, `purpose` (signup/reset_password), `expires_at` |

All IDs use PostgreSQL's `gen_random_uuid()` for cryptographically random UUIDs. Timestamps use `TIMESTAMPTZ` for timezone-aware storage.

---

## 🤝 Contributing

We welcome contributions from the open-source community!

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Make** your changes
4. **Run** quality checks:
   ```bash
   npm run lint          # ESLint
   npx tsc --noEmit      # TypeScript check
   npm audit             # Dependency audit
   ```
5. **Commit** using conventional commits:
   - `feat: add EPUB to PDF conversion support`
   - `fix: resolve memory leak in imageWorker`
   - `docs: update self-hosting guide`
   - `security: add CSP header to nginx config`
6. **Push** to your fork: `git push origin feat/amazing-feature`
7. **Open** a Pull Request

### Code Standards
- TypeScript strict mode enabled
- All API inputs validated with Zod schemas
- No `any` types in new code (existing uses are being migrated)
- All file operations go through the `storage.ts` service (never direct S3 calls)
- Environment variables accessed only through `config/env.ts`

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Maintained with precision by <strong>Sahil</strong> (<a href="https://github.com/Skedare240507">@Skedare240507</a>) and contributors.</sub>
  <br/><br/>
  <a href="#fileconvert">⬆ Back to Top</a>
</div>
