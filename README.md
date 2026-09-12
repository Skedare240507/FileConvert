<p align="center">
  <img src="public/logo.png" alt="FileConvert Logo" width="120" />
</p>

<h1 align="center">FileConvert</h1>

<p align="center">
  <strong>Enterprise-Grade, Distributed Multi-Format File Conversion & Document Processing Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/BullMQ-6.0-FF4154?style=for-the-badge" alt="BullMQ" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & System Design](#-architecture--system-design)
- [Complete Project Structure](#-complete-project-structure)
- [Core Engineering Rules & Standards](#-core-engineering-rules--standards)
- [Supported Formats & Conversion Matrix](#-supported-formats--conversion-matrix)
- [Technology Stack & Dependencies](#-technology-stack--dependencies)
- [Environment Variables & Configuration](#-environment-variables--configuration)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Worker & Background Processing](#-worker--background-processing)
- [Docker & Containerized Services](#-docker--containerized-services)
- [Security & Rate Limiting](#-security--rate-limiting)

---

## 🌟 Overview

**FileConvert** is a high-performance distributed document conversion, image manipulation, and PDF merging platform. It provides instant synchronous processing for lightweight conversions and asynchronous queued jobs backed by **Redis** and **BullMQ** for heavy document rendering and OCR tasks.

### Key Highlights
- ⚡ **Strict Clean Architecture**: Complete separation of frontend presentation (`src/`) and backend services (`backend/`).
- 🛡️ **Malware & Virus Screening**: In-flight stream screening with **ClamAV** before documents reach worker engines.
- 🔄 **Multi-Engine Routing**: Intelligent engine selection using Gotenberg (Chromium/LibreOffice), ImageMagick, PDF-Lib, SheetJS, and automated CloudConvert fallback.
- 📦 **Direct S3/B2 Upload Pipeline**: Signed pre-authenticated URLs for direct client-to-storage uploads to prevent memory bloat on API nodes.
- 🔒 **IDOR-Proof Anonymous Sessions**: Anonymous cryptographic tokens bind guest conversion/merge sessions securely without requiring an upfront account.
- 📊 **Real-time Live Progress**: Server-Sent Events (SSE) stream job processing state directly to client browsers.

---

## 🏗️ Architecture & System Design

```
                     ┌──────────────────────────────────────────────┐
                     │            Client (Next.js 16 UI)            │
                     └───────┬───────────────────────────────┬──────┘
                             │ Direct S3 Upload (Presigned)  │ API Requests
                             ▼                               ▼
                     ┌───────────────┐               ┌──────────────────────────────┐
                     │ Cloudflare R2 │               │ Next.js App Router (src/app) │
                     │ Backblaze B2  │               └──────────────┬───────────────┘
                     └───────▲───────┘                              │ Zod Validation & Rate Limit
                             │                                      ▼
                             │ Payload Fetch                 ┌──────────────────────────────┐
                             │ & Result Write                │   Backend Services & DB      │
                             │                               │ (backend/services, db/client)│
                             │                               └──────────────┬───────────────┘
                             │                                              │ Dispatch Job
                             │                                              ▼
                             │                               ┌──────────────────────────────┐
                             │                               │    Redis / BullMQ Queue      │
                             │                               └──────────────┬───────────────┘
                             │                                              │ Poll Jobs
                             │                                              ▼
                             │                               ┌──────────────────────────────┐
                             │                               │ BullMQ Worker Orchestrator   │
                             │                               │  (backend/workers/orchestr.) │
                             │                               └──────────────┬───────────────┘
                             │                                              │
              ┌──────────────┴──────────────┬───────────────────────────────┼──────────────────────────────┐
              ▼                             ▼                               ▼                              ▼
      ┌───────────────┐             ┌───────────────┐               ┌───────────────┐              ┌───────────────┐
      │   Gotenberg   │             │ pdf-converter │               │  ImageMagick  │              │ Tesseract.js  │
      │ (LibreOffice) │             │ (Custom Py/Go)│               │   / PDF-Lib   │              │     (OCR)     │
      └───────────────┘             └───────────────┘               └───────────────┘              └───────────────┘
              │                             │                               │                              │
              └─────────────────────────────┴───────────────────────────────┴──────────────────────────────┘
                                            │ Emergency Fallback (on error)
                                            ▼
                                    ┌───────────────┐
                                    │  CloudConvert │
                                    └───────────────┘
```

---

## 📁 Complete Project Structure

The project strictly follows domain isolation. The presentation layer lives in `src/`, while core business domain logic, database operations, queues, workers, and external service clients live in `backend/`.

```
FileConvert/
├── src/                                  # ── ALL FRONTEND & NEXT.JS CODE ──
│   ├── app/                              # Next.js App Router (Pages, Layouts & API routes)
│   │   ├── (auth)/                       # Auth routes (login, signup, forgot-password, reset-password)
│   │   ├── admin/                        # Admin dashboards and metrics
│   │   ├── api/                          # REST API Endpoints & SSE handlers
│   │   │   ├── admin/                    # Queue metrics & administration
│   │   │   ├── auth/                     # NextAuth, registration, OTP verification
│   │   │   ├── convert/                  # Conversion job creation, direct upload init, SSE live stream
│   │   │   ├── feedback/                 # User feedback endpoints
│   │   │   └── merge/                    # PDF merge session initiation, SSE live stream, download
│   │   ├── convert/                      # Conversion category & tool pages
│   │   │   ├── csv-to-excel/             # CSV to Excel converter
│   │   │   ├── excel-to-csv/             # Excel to CSV converter
│   │   │   ├── image/                    # Image format converters
│   │   │   ├── jpg-to-pdf/               # JPG/PNG to PDF converter
│   │   │   ├── jpg-to-ppt/               # JPG to PowerPoint converter
│   │   │   ├── merge/                    # PDF Merge Studio UI
│   │   │   ├── pdf-to-jpg/               # PDF to JPG rasterizer
│   │   │   ├── pdf-to-ppt/               # PDF to PPT converter
│   │   │   ├── pdf-to-word/              # PDF to DOCX converter
│   │   │   ├── ppt-to-pdf/               # PPT to PDF converter
│   │   │   ├── word-to-pdf/              # DOCX to PDF converter
│   │   │   └── ...                       # Additional tool combinations
│   │   ├── dashboard/                    # User dashboard & conversion history
│   │   ├── help/                         # Help, FAQ & documentation UI
│   │   ├── privacy/                      # Privacy policy and TOS
│   │   ├── profile/                      # User profile management
│   │   ├── globals.css                   # Global CSS theme & CSS variables
│   │   ├── layout.tsx                    # Root application layout
│   │   └── page.tsx                      # Landing & Hero Homepage
│   ├── components/                       # Shared React Components (Header, Modals, Uploaders)
│   ├── hooks/                            # Custom React hooks (useConverter, useSSE, etc.)
│   └── types/                            # Frontend TypeScript definitions & NextAuth augmentations
│
├── backend/                              # ── ALL BACKEND LOGIC (Domain Isolated) ──
│   ├── config/                           # Environment variables & constants validation
│   │   ├── env.ts                        # Strongly-typed fail-fast environment schema
│   │   └── constants.ts                  # File limits, MIME allowances, rate limits, tier limits
│   ├── db/                               # Database access layer
│   │   ├── client.ts                     # Prisma singleton instance
│   │   └── queries/                      # Strongly-typed DB query helpers
│   │       ├── auditLogs.ts              # Security & administrative audit logs
│   │       ├── conversionJobs.ts         # Conversion job lifecycle queries
│   │       ├── feedback.ts               # Feedback persistence
│   │       ├── mergeSessions.ts          # Merge session persistence & live status
│   │       ├── usageCounters.ts          # Daily & monthly user quota tracking
│   │       └── users.ts                  # User authentication & profile records
│   ├── middleware/                       # Route guards & security middleware
│   │   ├── withAdminAuth.ts              # Role-based admin access control
│   │   ├── withAuth.ts                   # NextAuth session verification
│   │   └── withRateLimit.ts              # Redis sliding-window rate limiter
│   ├── queue/                            # BullMQ job queue management
│   │   ├── client.ts                     # Redis connection singleton
│   │   ├── queues.ts                     # Queue definitions (conversion, merge, cleanup)
│   │   └── jobs/                         # Job payload TypeScript definitions
│   ├── services/                         # Pure business logic services (No HTTP knowledge)
│   │   ├── conversion/                   # Conversion engine drivers (Gotenberg, LibreOffice, SheetJS, CloudConvert)
│   │   ├── email/                        # Nodemailer transactional email delivery (OTP, receipts)
│   │   ├── payment/                      # Razorpay order creation & webhook verification
│   │   ├── scan/                         # ClamAV virus & malware stream scanner
│   │   └── storage/                      # Cloudflare R2 / Backblaze B2 S3 SDK wrapper
│   ├── utils/                            # Shared backend utilities
│   │   ├── fileType.ts                   # Magic bytes file-type detection (anti-spoofing)
│   │   ├── logger.ts                     # Structured JSON logger & Sentry integration
│   │   ├── planLimits.ts                 # Quota calculation per user tier (Free vs Pro)
│   │   ├── sanitize.ts                   # Filename & path traversal sanitizers
│   │   └── tenantSecurity.ts             # IDOR protection & anonymous session assertion
│   ├── validation/                       # Zod schemas for input validation
│   │   ├── conversion.ts                 # Conversion API schema
│   │   ├── merge.ts                      # Merge API schema
│   │   ├── payment.ts                    # Payment schema
│   │   └── upload.ts                     # File size, extension & MIME validation
│   └── workers/                          # BullMQ standalone queue worker processors
│       ├── cleanupWorker.ts              # Purges expired S3 files (TTL cleanup)
│       ├── documentWorker.ts             # Office & PDF processing via Gotenberg
│       ├── imageWorker.ts                # Image resizing & rasterization
│       ├── ocrWorker.ts                  # Tesseract OCR pipeline
│       └── orchestrator.ts               # Multi-queue consumer entry point
│
├── pdf-converter/                        # Standalone Python/LibreOffice microservice
│   ├── app.py                            # Microservice HTTP server
│   ├── Dockerfile                        # Container definition with LibreOffice & Poppler
│   └── requirements.txt                  # Python dependencies
│
├── prisma/                               # Database Schema & Migrations
│   ├── schema.prisma                     # PostgreSQL schema definition
│   └── migrations/                       # SQL schema migration history
│
├── public/                               # Static public assets (Favicon, Logo, Images)
├── nginx/                                # Nginx reverse proxy configuration
├── docker-compose.yml                    # Multi-container orchestration (Redis, Gotenberg, ClamAV, etc.)
├── package.json                          # Node dependencies & npm scripts
├── tsconfig.json                         # TypeScript path alias configuration
└── next.config.mjs                       # Next.js bundler, Turbopack & external package configuration
```

---

## 📜 Core Engineering Rules & Standards

For developers and contributors maintaining this repository:

### 1. Architectural Boundaries
- **No HTTP in `backend/`**: Files in `backend/services/`, `backend/db/`, and `backend/workers/` must remain pure functions. They must never import `NextRequest` or return `NextResponse`.
- **No Raw Prisma in API routes**: Always use domain helpers in `backend/db/queries/*.ts` to guarantee uniform indexing, error handling, and auditing.
- **Fail-Fast Configuration**: Never use `process.env.VARIABLE_NAME` directly across the codebase. Always import from `@/backend/config/env`, which validates environment variables at startup.

### 2. TypeScript Path Aliases
To avoid brittle relative paths (`../../../../`), the TypeScript compiler uses clean path resolution:
- `@/backend/*` $\rightarrow$ Points directly to `./backend/*`
- `@/*` $\rightarrow$ Points directly to `./src/*`

### 3. File Security & Anti-Spoofing
- **Magic-Byte Inspection**: Never trust user-provided extensions or `Content-Type` headers. Files are inspected via `backend/utils/fileType.ts` before processing.
- **Sanitized Filenames**: All filenames undergo ASCII sanitization in `backend/utils/sanitize.ts` to prevent path traversal (`../`) and shell injection.
- **IDOR Prevention**: Guest conversions are bound to a cryptographically secure `anon_token`. Access to downloads or SSE streams requires verifying ownership.

---

## 🔄 Supported Formats & Conversion Matrix

| Source Format | Target Format | Engine | Processing Mode |
|:---|:---|:---|:---|
| **PDF** | Word (`.docx`) | Gotenberg / pdf-converter | Async / Queued |
| **PDF** | PowerPoint (`.pptx`) | Gotenberg / pdf-converter | Async / Queued |
| **PDF** | Images (`.jpg`, `.png`) | ImageMagick / pdf-lib | Async / Queued |
| **Word** (`.docx`) | PDF (`.pdf`) | Gotenberg (LibreOffice) | Async / Queued |
| **PowerPoint** (`.pptx`)| PDF (`.pdf`) | Gotenberg (LibreOffice) | Async / Queued |
| **Excel** (`.xlsx`, `.xls`)| CSV (`.csv`) | SheetJS | Instant / Synchronous |
| **CSV** (`.csv`) | Excel (`.xlsx`) | SheetJS | Instant / Synchronous |
| **Images** (`.jpg`, `.png`)| PDF (`.pdf`) | PDF-Lib / ImageMagick | Instant / Synchronous |
| **Multiple PDFs** | Single PDF (Merge) | PDF-Lib | Instant / Queued |
| **Scanned Images/PDF** | Searchable PDF / Text | Tesseract OCR | Async / Queued |

*Note: If local Gotenberg or LibreOffice instances experience an unrecoverable failure, jobs seamlessly route to the CloudConvert API fallback.*

---

## 🛠️ Technology Stack & Dependencies

### Frontend (`src/`)
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19
- **Styling**: Vanilla CSS Modules (Theme token variables, responsive design, zero runtime CSS-in-JS overhead)
- **State & Real-time**: Custom React hooks with native SSE (`EventSource`)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) (OAuth 2.0 with Google & Credentials-based OTP)

### Backend & Core Services (`backend/`)
- **Database ORM**: [Prisma ORM 5.22](https://www.prisma.io/)
- **Database Engine**: PostgreSQL (Supabase / Self-hosted)
- **Queue & Event Bus**: [BullMQ 6](https://docs.bullmq.io/) over **Redis 7**
- **Object Storage**: S3-compatible storage ([Cloudflare R2](https://www.cloudflare.com/products/r2/) or [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html)) via `@aws-sdk/client-s3`
- **Validation**: [Zod](https://zod.dev/)
- **Email Service**: [Nodemailer 10](https://nodemailer.com/) (Security patched)
- **Telemetry & Monitoring**: [Sentry Next.js SDK 10](https://sentry.io/)

### Conversion & Microservice Engines
- **Gotenberg 8**: Dockerized stateless API for Chromium and LibreOffice document conversion
- **ClamAV**: Real-time antivirus screening daemon
- **pdf-lib**: Pure JavaScript PDF manipulation and merging
- **SheetJS (`xlsx`)**: Spreadsheet parsing and generation
- **Tesseract.js**: OCR extraction for images and scanned documents

---

## ⚙️ Environment Variables & Configuration

Create a `.env` file in the root directory:

```env
# ── Database (PostgreSQL / Supabase) ──────────────────────────────────────────
DATABASE_URL="postgresql://postgres:password@localhost:5432/fileconvert?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/fileconvert?schema=public"

# ── NextAuth Configuration ───────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-key"

# ── Google OAuth Provider ────────────────────────────────────────────────────
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ── Object Storage (Cloudflare R2 / Backblaze B2) ─────────────────────────────
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"
B2_REGION="us-east-005"
B2_ACCESS_KEY_ID="your-access-key-id"
B2_SECRET_ACCESS_KEY="your-secret-access-key"
B2_BUCKET="fileconvert-storage"

# ── Redis (Queue & Sliding-Window Rate Limiting) ─────────────────────────────
REDIS_URL="redis://127.0.0.1:6379"

# ── Microservices & Engines ──────────────────────────────────────────────────
GOTENBERG_URL="http://127.0.0.1:3001"
PDF_CONVERTER_URL="http://127.0.0.1:8080"
CLAMAV_HOST="127.0.0.1"
CLAMAV_PORT="3310"

# ── Emergency Fallback (Optional) ────────────────────────────────────────────
CLOUDCONVERT_API_KEY="your-optional-cloudconvert-api-key"

# ── Email Service (SMTP / Nodemailer) ─────────────────────────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="notifications@fileconvert.app"
SMTP_PASS="your-app-password"
SMTP_FROM="FileConvert <noreply@fileconvert.app>"

# ── Payment Gateway (Razorpay - Optional) ────────────────────────────────────
RAZORPAY_KEY_ID="rzp_test_xxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# ── Error Monitoring (Sentry - Optional) ─────────────────────────────────────
SENTRY_DSN=""
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS)
- **npm** or **pnpm**
- **Docker & Docker Compose** (for Redis, Gotenberg, and ClamAV)

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/Skedare240507/FileConvert.git
cd FileConvert
npm install
```

### Step 2: Database Migration & Prisma Setup
```bash
# Push schema changes to your PostgreSQL database
npx prisma db push

# Generate the typed Prisma Client
npx prisma generate
```

### Step 3: Launch Supporting Docker Services
Start Redis, Gotenberg, and ClamAV in the background:
```bash
docker compose up -d redis gotenberg clamav pdf-converter
```

Check health:
```bash
docker compose ps
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Worker & Background Processing

For heavy document conversions, jobs are pushed to BullMQ queues. In production, worker processes run independently from the web app.

To start the conversion and cleanup orchestrator locally:
```bash
npm run worker
```

### Worker Responsibilities:
- **`documentWorker.ts`**: Communicates with Gotenberg to convert Word/PPT/PDF.
- **`imageWorker.ts`**: Handles multi-page image rasterization and compression.
- **`ocrWorker.ts`**: Extracts text layers using Tesseract.js.
- **`cleanupWorker.ts`**: Periodically sweeps and deletes temporary files in S3/B2 after their 1-hour expiration.

---

## 🐳 Docker & Containerized Services

The repository includes a production-ready `docker-compose.yml` with the following service stack:

| Container Name | Service | Local Port | Health Check |
|:---|:---|:---|:---|
| `fileconvert-redis` | Redis 7 Alpine | `6379` | `redis-cli ping` |
| `fileconvert-gotenberg`| Gotenberg 8 | `3001` $\rightarrow$ `3000` | HTTP `/health` |
| `fileconvert-clamav` | ClamAV Anti-Malware | `3310` | `clamdcheck.sh` |
| `fileconvert-pdf-converter` | Custom Python/LibreOffice | `8080` | Python urllib `/health` |
| `fileconvert-nginx` | Nginx Alpine Gateway | `80` | Native HTTP |

---

## 🛡️ Security & Rate Limiting

- **Sliding-Window Redis Limiter**: Built into `backend/middleware/withRateLimit.ts`. Protects API endpoints against brute force, OTP flooding, and DDoS.
- **Content Security & Antivirus**: Uploaded documents are streamed through ClamAV in memory before processing. Any flagged virus immediately terminates the job and quarantines the file.
- **Automatic TTL Deletion**: Files uploaded to storage buckets are assigned a strict 1-hour lifecycle TTL and automatically purged by `cleanupWorker.ts`.
- **Admin Audit Trail**: Every sensitive administrative query (queue purges, quota adjustments) is logged to the `AuditLog` table with timestamp and IP origin.

---

## 📄 Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Launches Next.js in Turbopack development mode |
| `npm run build` | Compiles an optimized production build |
| `npm run start` | Runs the Next.js production server |
| `npm run worker` | Starts the BullMQ background worker orchestrator |
| `npm run lint` | Runs ESLint 9 checks |
| `npx prisma studio` | Opens Prisma's graphical database browser |

---

## 👥 Authors & Maintainers

- **Sahil** ([@Skedare240507](https://github.com/Skedare240507))

---

<p align="center">
  <sub>Built with ❤️ for high-throughput, secure document processing.</sub>
</p>
