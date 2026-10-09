<div align="center">

  <img src="/public/logo.png" alt="FileConvert Logo" width="160" />

  # FileConvert

  ### **The Open-Source, Distributed Document Conversion & Processing Engine**

  *Transform, merge, rasterize, and OCR documents at scale with enterprise-grade security, nonce-based CSP, real-time malware scanning, and sub-second queue dispatch.*

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

## Demo Screenshots

<table>
  <tr>
    <td width="50%"><img src="public/Screenshots/Screenshot_4-10-2026_10223_localhost.jpeg" alt="FileConvert home page" width="100%" /></td>
    <td width="50%"><img src="public/Screenshots/Screenshot_4-10-2026_102215_localhost.jpeg" alt="FileConvert conversion interface" width="100%" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="public/Screenshots/Screenshot_4-10-2026_102226_localhost.jpeg" alt="FileConvert file upload workflow" width="100%" /></td>
    <td width="50%"><img src="public/Screenshots/Screenshot_4-10-2026_102240_localhost.jpeg" alt="FileConvert conversion options" width="100%" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="public/Screenshots/Screenshot_4-10-2026_102257_localhost.jpeg" alt="FileConvert conversion progress" width="100%" /></td>
    <td width="50%"><img src="public/Screenshots/Screenshot_4-10-2026_102316_localhost.jpeg" alt="FileConvert completed conversion" width="100%" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="public/Screenshots/Screenshot_4-10-2026_102334_localhost.jpeg" alt="FileConvert dashboard" width="100%" /></td>
    <td width="50%"></td>
  </tr>
</table>

---

## 📋 Table of Contents

- [Demo Screenshots](#demo-screenshots)
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
- [SEO & Web Standards](#-seo--web-standards)
- [CI/CD Pipeline](#-cicd-pipeline)
- [API Reference](#-api-reference)
- [Background Workers & Job Queue](#-background-workers--job-queue)
- [Monitoring & Observability](#-monitoring--observability)
- [Environment Variable Safety](#-environment-variable-safety)
- [Database Schema](#%EF%B8%8F-database-schema)
- [Contributing](#-contributing)

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
      <h3>🔐 Nonce-Based Content Security Policy</h3>
      <p>Per-request cryptographic nonces eliminate <code>unsafe-inline</code>/<code>unsafe-eval</code> in production. Next.js middleware generates a fresh 128-bit nonce every request, stamping all hydration scripts — malicious injected scripts are blocked by the browser.</p>
    </td>
    <td width="50%">
      <h3>🔄 Multi-Engine Fallback Routing</h3>
      <p>Automatic engine selection across <strong>Gotenberg 8</strong> (LibreOffice & Chromium), <strong>pdf2docx</strong> (Python), <strong>ImageMagick</strong>, <strong>PDF-Lib</strong>, <strong>SheetJS</strong>, <strong>Tesseract.js</strong>, and automated <strong>CloudConvert</strong> cloud fallback.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📦 Direct Storage Streaming</h3>
      <p>Pre-signed cryptographic direct uploads to Backblaze B2 S3-compatible storage. Web servers never buffer user payloads into memory — files stream directly from browser to bucket.</p>
    </td>
    <td width="50%">
      <h3>🔒 Automated Security Scanning</h3>
      <p>GitHub Actions CI/CD with <strong>Trivy</strong> vulnerability scanner, <strong>CodeQL</strong> SAST analysis, <strong>ESLint</strong> static analysis, TypeScript strict mode, and <strong>npm audit</strong> on every push and pull request.</p>
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

    subgraph Middleware ["Edge Middleware (src/middleware.ts)"]
        CSP["Nonce-Based CSP Generator<br/>Per-request 128-bit nonce<br/>All security headers"]
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

    UI -- HTTPS --> Middleware
    Middleware -- Nonce stamped response --> UI
    Middleware -- Proxy Pass --> Nginx --> API
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
| **Security** | Nonce-CSP Middleware, ClamAV Antivirus, bcryptjs, HMAC-SHA256, Zod 4, Magic-Byte Verification, HSTS | ![ClamAV](https://img.shields.io/badge/ClamAV-D22128?style=flat-square) ![Zod](https://img.shields.io/badge/Zod_4-3E67B1?style=flat-square) |
| **Email** | Nodemailer 10 (SMTP) | ![Nodemailer](https://img.shields.io/badge/Nodemailer-339933?style=flat-square) |
| **Reverse Proxy** | Nginx Alpine (Rate Limiting, Security Headers, WebSocket) | ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white) |
| **Containerization** | Docker, Docker Compose (5 services) | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) |
| **CI/CD** | GitHub Actions (3 workflows) | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white) |
| **Static Analysis** | ESLint 9, CodeQL (SAST), Trivy (CVE Scanner), npm audit | ![ESLint](https://img.shields.io/badge/ESLint_9-4B32C3?style=flat-square&logo=eslint&logoColor=white) ![Trivy](https://img.shields.io/badge/Trivy-1904DA?style=flat-square) |
| **Monitoring** | Sentry 11 (Error Tracking & APM), Structured JSON Logger | ![Sentry](https://img.shields.io/badge/Sentry_11-362D59?style=flat-square&logo=sentry&logoColor=white) |
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
│   ├── middleware.ts                     # 🔐 Edge CSP middleware (nonce-based, all security headers)
│   ├── app/                              # Next.js App Router
│   │   ├── login/                        # Email/password + Google OAuth sign-in
│   │   ├── admin/                        # Admin dashboard (analytics, queue metrics)
│   │   ├── convert/                      # 19 dedicated conversion tool pages
│   │   ├── api/                          # REST API & SSE endpoints
│   │   ├── layout.tsx                    # Root layout (HTML shell, nonce injection, fonts)
│   │   └── page.tsx                      # Landing page & hero
│   ├── components/                       # Reusable React 19 UI (Header, Modals)
│   ├── hooks/                            # Custom hooks (useConverter — SSE streaming)
│   └── types/                            # Frontend TypeScript types & NextAuth extensions
│
├── backend/                              # ── CORE DOMAIN & ENGINE (Isolated) ──
│   ├── config/                           # Env validation & constants
│   ├── db/                               # Prisma client & typed queries
│   ├── middleware/                       # Auth & rate-limiting guards
│   ├── queue/                            # Redis BullMQ connection & jobs
│   ├── services/                         # Conversion clients, S3 storage, ClamAV
│   ├── utils/                            # File type magic-byte checkers, sanitization
│   └── workers/                          # Background processing orchestrator
│
├── pdf-converter/                        # Python Microservice (PDF → DOCX)
├── prisma/                               # PostgreSQL schema
├── nginx/                                # Production reverse proxy config
├── docker-compose.yml                    # Local development stack
└── package.json                          # Dependencies
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

All environment variables are **validated at startup** via `backend/config/env.ts`. Missing required variables cause an immediate crash with a clear error message.

<details>
<summary><strong>📋 Complete Environment Variables Reference</strong></summary>

```env
# DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/fileconvert?schema=public"

# NEXTAUTH
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-32-byte-hex-secret"

# GOOGLE OAUTH
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# OBJECT STORAGE
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"
B2_REGION="us-east-005"
B2_ACCESS_KEY_ID="your-key-id"
B2_SECRET_ACCESS_KEY="your-secret-key"
B2_BUCKET="fileconvert-storage"

# REDIS
REDIS_URL="redis://127.0.0.1:6379"

# DOCKER SERVICES
GOTENBERG_URL="http://127.0.0.1:3001"
PDF_CONVERTER_URL="http://127.0.0.1:8080"
CLAMAV_HOST="127.0.0.1"
CLAMAV_PORT="3310"

# EMAIL — SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="notifications@fileconvert.app"
SMTP_PASS="your-app-password"
SMTP_FROM="FileConvert <noreply@fileconvert.app>"
```

</details>

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

#### Admin Route Cloaking (Zero-Trust)

Admin endpoints **do not return 401 or 403** — they return **404 Not Found**. This prevents attackers from confirming the existence of admin API routes through error code enumeration.

Admin access requires **all three** of:
1. Valid authenticated session
2. `role === 'admin'` in the database
3. Email in the `ADMIN_EMAILS` environment variable whitelist

---

## 🛡️ Security & Hardening

Security in FileConvert is treated as a **first-class citizen**. Rather than relying on a single perimeter defense, the system employs a strict **Defense-in-Depth (DiD)** architecture that assumes all user input and uploaded files are hostile.

### Defense-in-Depth Architecture

```mermaid
flowchart TD
    Upload["User Upload (Browser)"] --> Middleware

    subgraph Layer0 ["Layer 0: Edge Defense"]
        Middleware["Next.js Edge Middleware<br/>• Nonce-Based CSP<br/>• HSTS & Security Headers"]
    end

    subgraph Layer1 ["Layer 1: Network & Proxy"]
        Nginx["Nginx Reverse Proxy<br/>• DDoS Protection<br/>• TLS 1.3 Strict<br/>• 10 req/s Rate Limit"]
    end

    subgraph Layer2 ["Layer 2: API & Application"]
        Rate["Redis Token Bucket Rate Limiter"]
        Validation["Zod Strict Schema Validation"]
        Magic["Magic Byte MIME Verification"]
        Sanitize["Regex Filename Sanitizer"]
    end

    subgraph Layer3 ["Layer 3: Antivirus & Payload"]
        ClamAV["ClamAV Daemon<br/>TCP INSTREAM Protocol (No Disk IO)"]
    end

    subgraph Layer4 ["Layer 4: Identity & Access"]
        Auth["JWT NextAuth.js Validation"]
        IDOR["Resource IDOR Protection"]
        Admin["Admin Route Cloaking (404)"]
    end

    subgraph Layer5 ["Layer 5: Data Storage"]
        TTL["Ephemeral Storage (1h TTL)"]
        Signed["Pre-signed URL Cryptography"]
        Encrypt["bcrypt Password Hashing"]
    end

    Middleware --> Nginx --> Rate --> Validation --> Magic --> Sanitize
    Sanitize --> ClamAV
    ClamAV -- "Clean / Safe" --> Auth --> IDOR --> Admin
    ClamAV -- "Infected / Suspicious" --> Destroy["🚨 Payload Destroyed Instantly"]
    Admin --> TTL --> Signed
```

### 1. Cryptographic Nonce-Based CSP
Cross-Site Scripting (XSS) is entirely mitigated at the network edge. 
- The `src/middleware.ts` generates a **fresh, cryptographically secure 128-bit random nonce** on every single HTTP request.
- This nonce is stamped onto the `Content-Security-Policy` HTTP header.
- Next.js injects this exact nonce into all legitimate hydration `<script>` tags.
- Any unauthorized scripts (e.g., from a compromised dependency or malicious user input) lack the nonce and are blocked by the browser. We strictly enforce `script-src 'self' 'nonce-...'; object-src 'none'; base-uri 'self';`.

### 2. Real-Time Malware Scanning (ClamAV)
Document conversion systems are prime targets for malicious payloads (e.g., infected PDFs, macro-embedded Word docs).
- **Every uploaded file** is routed through a localized ClamAV antivirus daemon before being placed in the queue.
- We utilize the TCP **INSTREAM** protocol. The file is never temporarily saved to disk; it is piped from memory into the ClamAV daemon in 8KB chunks.
- If a virus, trojan, or malicious macro is detected, the request is immediately terminated with a 400 Bad Request, and the file never reaches the conversion workers.

### 3. Strict Input Validation & Magic Bytes
Extension spoofing (e.g., renaming `malware.exe` to `document.pdf`) is impossible.
- **Zod Validation**: All API payloads are strictly typed and parsed. Unknown fields are stripped.
- **Magic Byte Verification**: We read the actual binary headers (the first few hex bytes) of the uploaded file. If a file claims to be a PDF but doesn't start with `%PDF-` (`25 50 44 46`), it is rejected.
- **Filename Sanitization**: Uploaded filenames are stripped of path traversal characters (`../`), null bytes (`\0`), and special symbols before interacting with cloud storage.

### 4. Zero-Trust Admin Cloaking
Admin dashboards are often targets for brute-force directory traversal.
- Admin API routes do **not** return `401 Unauthorized` or `403 Forbidden` if you lack access.
- Instead, they return a generic `404 Not Found`. This prevents attackers from enumerating or confirming the existence of administrative endpoints.
- Admin access requires three layers: a valid JWT, a database role of `admin`, and the user's email matching a hardcoded server-side `.env` whitelist.

### 5. Ephemeral Storage & IDOR Protection
User privacy is guaranteed by design.
- **Insecure Direct Object Reference (IDOR)** is prevented by binding every conversion job and file to the authenticated user's unique UUID. A user cannot query or download another user's file.
- **1-Hour Time-To-Live (TTL)**: No data is kept forever. The `cleanupWorker` runs every 15 minutes, permanently destroying input and output files from the S3 bucket that are older than 60 minutes.

### 6. DoS & Brute Force Protection
- **Nginx Rate Limiting**: The reverse proxy caps API requests to 10 req/sec per IP, mitigating simple volumetric attacks.
- **Account Lockouts**: The authentication system tracks failed login attempts. Upon 5 consecutive failures, the account is locked for 30 minutes to prevent credential stuffing and brute-force attacks, and a security alert email is dispatched to the user.

---

## 🌐 SEO & Web Standards

### Per-Page Metadata Architecture

All 19 converter pages use a **server-side `layout.tsx`** wrapper to export robust metadata (Title, OpenGraph, Canonical) while allowing the inner `page.tsx` to remain a interactive Client Component for file uploads.

---

## 🔄 CI/CD Pipeline

```mermaid
flowchart TD
    Push[Push / PR to main] --> Install[npm ci]
    Install --> Prisma[npx prisma generate]
    
    Prisma --> Lint[ESLint Static Analysis]
    Prisma --> Type[tsc --noEmit Typecheck]
    Prisma --> Audit[npm audit Dependency CVEs]
    Prisma --> Trivy[Trivy Docker & Repo Vuln Scan]
    
    Push --> CodeQL[GitHub CodeQL SAST Analysis]
```

---

## 📡 API Reference

### 1. Upload & Conversion

#### Initialize Direct Upload
```http
POST /api/convert/upload/init
Content-Type: application/json
```

#### Create Conversion Job
```http
POST /api/convert/jobs
Content-Type: application/json
```

### 2. Real-Time Job Progress (SSE)
```http
GET /api/convert/jobs/<jobId>/live?token=<token>
Accept: text/event-stream
```

### 3. Download Converted File
```http
GET /api/convert/jobs/<jobId>/download?token=<token>
```

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

```mermaid
flowchart LR
    Job[Incoming Job] --> Read{Read workerType}
    Read -- "document" --> Doc[documentWorker.ts]
    Read -- "image" --> Img[imageWorker.ts]
    Read -- "ocr" --> Ocr[ocrWorker.ts]
    Read -- "merge" --> Mrg[mergeWorker.ts]
    Read -- "file-cleanup" --> Cln[cleanupWorker.ts]
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

### Cleanup Scheduler

- Runs every **15 minutes** (via `setInterval` in the orchestrator).
- Queries DB for conversion jobs and merge sessions older than **1 hour**.
- Enqueues cleanup jobs to delete R2 objects (input + output files).

---

## 📊 Monitoring & Observability

### Sentry Integration
- **Package**: `@sentry/nextjs` v11.
- **Production**: Errors forwarded via `captureException()` / `captureMessage()`.
- **Tunnel Route**: `/monitoring` proxies Sentry requests through Next.js to bypass ad-blockers (excluded from robots.txt).

---

## 🔐 Environment Variable Safety

### How Secrets Are Protected

| Protection | Details |
|:---|:---|
| **`.gitignore`** | `.env` is excluded from version control |
| **Server-Side Only** | All sensitive env vars accessed only in `backend/config/env.ts` — never imported in client components |
| **Build-Time Validation** | `env.ts` throws immediately if a required variable is missing at startup |
| **No `NEXT_PUBLIC_` Prefix** | Sensitive variables do NOT use the `NEXT_PUBLIC_` prefix, ensuring Next.js never bundles them into client JavaScript |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ ConversionJob : creates
    User ||--o{ MergeSession : initiates
    User ||--o{ Feedback : submits
    
    User {
        uuid id PK
        string email
        string password
        string role
        string plan
        int failedLoginAttempts
        datetime lockedUntil
    }
    
    Account {
        uuid id PK
        uuid userId FK
        string provider
        string providerAccountId
        string access_token
    }
    
    ConversionJob {
        uuid id PK
        uuid userId FK
        string source_type
        string target_type
        string status
        string worker_type
        string r2_input_key
        string r2_output_key
    }
    
    MergeSession {
        uuid id PK
        uuid userId FK
        string file_type
        int file_count
        string status
        string r2_output_key
    }
```

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
6. **Push** to your fork: `git push origin feat/amazing-feature`
7. **Open** a Pull Request

---

<div align="center">
  <sub>Maintained with precision by <strong>Sahil</strong> (<a href="https://github.com/Skedare240507">@Skedare240507</a>) and contributors.</sub>
  <br/><br/>
  <a href="#fileconvert">⬆ Back to Top</a>
</div>
