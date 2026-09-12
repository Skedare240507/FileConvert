<div align="center">

  <img src="public/logo.png" alt="FileConvert Logo" width="160" />

  # FileConvert

  ### **The Open-Source, Distributed Document Conversion & Processing Engine**

  *Transform, merge, rasterize, and OCR documents at scale with enterprise-grade security and sub-second queue dispatch.*

  <p align="center">
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-supported-formats">Supported Formats</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-self-hosting--docker">Self-Hosting</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  <p align="center">
    <a href="https://github.com/Skedare240507/FileConvert/releases"><img src="https://img.shields.io/github/v/release/Skedare240507/FileConvert?style=flat-square&color=4F46E5" alt="Release" /></a>
    <a href="https://github.com/Skedare240507/FileConvert/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License: MIT" /></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" /></a>
    <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma" alt="Prisma" /></a>
    <a href="https://redis.io"><img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" /></a>
    <a href="https://gotenberg.dev"><img src="https://img.shields.io/badge/Engine-Gotenberg%208-009688?style=flat-square" alt="Gotenberg" /></a>
    <a href="https://github.com/Skedare240507/FileConvert/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
  </p>

</div>

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
      <p>Real-time in-stream malware scanning via <strong>ClamAV</strong> before files enter conversion pipelines. Strict magic-byte mime inspection and IDOR-safe guest tokens.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔄 Multi-Engine Fallback Routing</h3>
      <p>Automatic engine selection across <strong>Gotenberg 8</strong> (LibreOffice & Chromium), <strong>ImageMagick</strong>, <strong>PDF-Lib</strong>, <strong>SheetJS</strong>, and automated <strong>CloudConvert</strong> cloud fallback.</p>
    </td>
    <td width="50%">
      <h3>📦 Direct Storage Streaming</h3>
      <p>Pre-signed cryptographic direct uploads to Cloudflare R2 / Backblaze B2 S3 storage. Web servers never buffer 100MB+ user payloads into memory.</p>
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

    subgraph Storage ["Object Storage"]
        S3["Cloudflare R2 / Backblaze B2 (S3-Compatible)"]
    end

    subgraph CoreAPI ["API & Domain Layer (backend/)"]
        API["Next.js Route Handlers (/api)"]
        Guard["Zod Validation & Sliding Rate Limiter"]
        DB[(PostgreSQL + Prisma ORM)]
    end

    subgraph Queue ["Message Broker"]
        Redis[(Redis 7 Cluster)]
        BullMQ["BullMQ Job Queues"]
    end

    subgraph Workers ["Worker Cluster (backend/workers)"]
        Orch["Worker Orchestrator"]
        DocW["Document Worker (Gotenberg/LibreOffice)"]
        ImgW["Image Worker (ImageMagick/PDF-Lib)"]
        OcrW["OCR Worker (Tesseract.js)"]
        CleanW["TTL Cleanup Worker (1h Expiration)"]
        Clam["ClamAV Antivirus Daemon"]
    end

    UI -- 1. Direct Presigned Upload --> S3
    UI -- 2. Create Job / Merge Session --> API
    API --> Guard --> DB
    API -- 3. Dispatch Job --> BullMQ --> Redis
    BullMQ --> Orch
    Orch -- 4. Scan Payload --> Clam
    Clam -- Clean --> DocW & ImgW & OcrW
    DocW & ImgW & OcrW -- 5. Write Converted Artifact --> S3
    DocW & ImgW & OcrW -- 6. Update Status & Emit --> DB & SSE
    SSE -- 7. Real-Time State Updates --> UI
```

---

## 📁 Repository Structure

The codebase is organized into isolated domains, guaranteeing that the **Frontend** presentation layer and **Backend** processing engine can be tested and developed independently without coupling.

```
fileconvert/
├── src/                                  # ── PRESENTATION LAYER (Next.js 16) ──
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/                       # Auth views (login, signup, reset-password)
│   │   ├── admin/                        # Administrative analytics & queue metrics
│   │   ├── api/                          # REST & Server-Sent Events (SSE) endpoints
│   │   │   ├── admin/                    # Queue inspection & worker stats
│   │   │   ├── auth/                     # NextAuth authentication & OTP handling
│   │   │   ├── convert/                  # Conversion job lifecycle & direct upload
│   │   │   ├── feedback/                 # User feedback ingestion
│   │   │   └── merge/                    # PDF Merge Studio streaming endpoints
│   │   ├── convert/                      # Dedicated tool landing pages (30+ routes)
│   │   ├── dashboard/                    # User conversion history & active downloads
│   │   ├── layout.tsx                    # Master HTML shell & CSS token providers
│   │   └── page.tsx                      # Landing & Hero presentation
│   ├── components/                       # Reusable React 19 UI widgets (Header, Modals, Dropzones)
│   ├── hooks/                            # Custom state & SSE live streaming hooks (useConverter)
│   └── types/                            # Frontend interface definitions & NextAuth type extensions
│
├── backend/                              # ── CORE DOMAIN & ENGINE (Isolated) ──
│   ├── config/                           # Fail-fast typed configuration
│   │   ├── env.ts                        # Zod-backed environment validator
│   │   └── constants.ts                  # MIME registries, tier quotas, TTL durations
│   ├── db/                               # Database persistence layer
│   │   ├── client.ts                     # Prisma client singleton
│   │   └── queries/                      # Strongly-typed queries (users, jobs, auditLogs, feedback)
│   ├── middleware/                       # Edge & API security guards
│   │   ├── withAuth.ts                   # Session extraction & tenant verification
│   │   ├── withAdminAuth.ts              # RBAC guard with audit trail logging
│   │   └── withRateLimit.ts              # Redis sliding-window rate limiter
│   ├── queue/                            # BullMQ job management
│   │   ├── client.ts                     # Redis connection provider
│   │   ├── queues.ts                     # Queue registries (conversion, merge, cleanup)
│   │   └── jobs/                         # Job payload contracts
│   ├── services/                         # Pure business logic (No HTTP knowledge)
│   │   ├── conversion/                   # Drivers (Gotenberg, LibreOffice, SheetJS, CloudConvert)
│   │   ├── email/                        # Nodemailer 10 transactional mailer (OTP, receipts)
│   │   ├── payment/                      # Razorpay integration & webhook verifier
│   │   ├── scan/                         # ClamAV daemon antivirus stream scanner
│   │   └── storage/                      # Cloudflare R2 / Backblaze B2 S3 client
│   ├── utils/                            # Shared domain utilities
│   │   ├── fileType.ts                   # Magic-byte file identification (Anti-spoofing)
│   │   ├── logger.ts                     # Structured JSON logger & Sentry reporter
│   │   ├── sanitize.ts                   # Path-traversal & shell sanitizers
│   │   └── tenantSecurity.ts             # IDOR protection & guest session validation
│   └── workers/                          # BullMQ background worker processors
│       ├── cleanupWorker.ts              # Scheduled 1-hour TTL file purger
│       ├── documentWorker.ts             # Gotenberg / LibreOffice document conversion
│       ├── imageWorker.ts                # Multi-page image rasterization & PDF packing
│       ├── ocrWorker.ts                  # Tesseract OCR text layer generator
│       └── orchestrator.ts               # Master worker daemon entry point
│
├── pdf-converter/                        # Standalone Python/LibreOffice Microservice
│   ├── app.py                            # High-speed document rendering server
│   └── Dockerfile                        # Container recipe with LibreOffice & Poppler
│
├── prisma/                               # Database Schema & Migrations
│   └── schema.prisma                     # PostgreSQL schema specification
│
├── public/                               # Static web assets & branded illustrations
├── nginx/                                # Production reverse proxy configuration
├── docker-compose.yml                    # Local multi-service development stack
└── tsconfig.json                         # Path mapping configuration (@/backend/* & @/*)
```

---

## 🔄 Supported Formats

| Category | Input Format | Output Format | Engine | Mode |
|:---|:---|:---|:---|:---|
| **Office Documents** | `.docx`, `.doc` | `.pdf` | Gotenberg (LibreOffice) | Queued |
| **Presentations** | `.pptx`, `.ppt` | `.pdf`, `.jpg` | Gotenberg / Poppler | Queued |
| **Spreadsheets** | `.xlsx`, `.xls` | `.csv` | SheetJS (`xlsx`) | Instant |
| **Data Interchange** | `.csv` | `.xlsx` | SheetJS (`xlsx`) | Instant |
| **PDF Processing** | `.pdf` | `.docx`, `.pptx` | Gotenberg / pdf-converter | Queued |
| **PDF Rasterization** | `.pdf` | `.jpg`, `.png` | ImageMagick / pdf-lib | Queued |
| **PDF Merging** | Multiple `.pdf` | Single `.pdf` | PDF-Lib | Instant / Queued |
| **Images** | `.jpg`, `.png`, `.webp` | `.pdf` | PDF-Lib | Instant |
| **Scanned Docs** | Scanned `.pdf`, `.jpg` | Searchable `.pdf`, `.txt` | Tesseract.js (OCR) | Queued |

---

## 💻 Tech Stack

<div align="center">

| Layer | Technologies |
|:---|:---|
| **Frontend UI** | Next.js 16 (App Router), React 19, Vanilla CSS Modules, NextAuth.js |
| **API & Middleware** | Node.js 20+ LTS, TypeScript 5, Zod 4, Sentry 10 |
| **Job Queue & Cache** | BullMQ 6, Redis 7 (Alpine) |
| **Database & ORM** | PostgreSQL 15+, Prisma ORM 5.22 |
| **File Storage** | S3 API Compliant (Cloudflare R2, Backblaze B2, AWS S3) |
| **Rendering Engines** | Gotenberg 8, LibreOffice 24, ImageMagick, PDF-Lib, Tesseract.js |
| **Security & Auditing** | ClamAV Anti-Malware Daemon, Sliding-Window Token Bucket, Magic-Byte Parser |
| **DevOps & Proxy** | Docker, Docker Compose, Nginx, Turbopack |

</div>

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS)
- **Docker & Docker Compose** (for Redis, Gotenberg & ClamAV)
- **PostgreSQL Database** (Local or Supabase)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Skedare240507/FileConvert.git
cd FileConvert

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the sample environment file and adjust your credentials:
```bash
cp .env.example .env
```

<details>
<summary><strong>🔑 Click to inspect required environment variables</strong></summary>

```env
# Database (PostgreSQL / Supabase)
DATABASE_URL="postgresql://postgres:password@localhost:5432/fileconvert?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/fileconvert?schema=public"

# NextAuth Secret & Host
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secure-32-byte-hex-secret"

# OAuth (Google)
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"

# Object Storage (S3 / Backblaze B2 / Cloudflare R2)
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"
B2_REGION="us-east-005"
B2_ACCESS_KEY_ID="your-key-id"
B2_SECRET_ACCESS_KEY="your-secret-key"
B2_BUCKET="fileconvert-storage"

# Redis Connection
REDIS_URL="redis://127.0.0.1:6379"

# Microservices
GOTENBERG_URL="http://127.0.0.1:3001"
PDF_CONVERTER_URL="http://127.0.0.1:8080"
CLAMAV_HOST="127.0.0.1"
CLAMAV_PORT="3310"

# Optional Cloud Fallback & Email
CLOUDCONVERT_API_KEY=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="notifications@fileconvert.app"
SMTP_PASS="your-app-password"
SMTP_FROM="FileConvert <noreply@fileconvert.app>"
```
</details>

### 4. Database Setup
```bash
# Push schema to database
npx prisma db push

# Generate typed Prisma client
npx prisma generate
```

### 5. Launch Support Containers
```bash
docker compose up -d redis gotenberg clamav pdf-converter
```

### 6. Start Development Servers

Run the frontend web application:
```bash
npm run dev
```

In a separate terminal, start the background worker orchestrator:
```bash
npm run worker
```

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📡 API Reference

FileConvert exposes a clean RESTful API for programmatically dispatching conversions.

### 1. Initialize Direct Upload
```http
POST /api/convert/upload/init
Content-Type: application/json

{
  "filename": "quarterly-report.docx",
  "sourceType": "docx",
  "targetType": "pdf",
  "fileSize": 2048576
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "jobId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "uploadUrl": "https://s3.us-east-005.backblazeb2.com/fileconvert-storage/raw/...",
  "anonToken": "c4ca4238a0b923820dcc509a6f75849b"
}
```

### 2. Stream Real-Time Job Progress (SSE)
```http
GET /api/convert/jobs/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/live?token=c4ca4238a0b923820dcc509a6f75849b
Accept: text/event-stream
```

**Event Stream Output**:
```text
event: status
data: {"status": "scanning", "progress": 25}

event: status
data: {"status": "processing", "progress": 70, "engine": "gotenberg"}

event: status
data: {"status": "completed", "progress": 100, "downloadUrl": "/api/convert/jobs/.../download"}
```

---

## 🛡️ Security & Privacy

- **In-Memory Antivirus Screening**: All documents are streamed directly through ClamAV before hitting workers. Infected files are destroyed immediately.
- **Strict 1-Hour TTL Policy**: Processed files are permanently purged from object storage after 60 minutes by `cleanupWorker.ts`.
- **Sliding-Window Rate Limiting**: Redis-backed token bucket limits prevent API scraping and denial-of-service attempts.
- **IDOR Protection**: Non-authenticated guest conversions use cryptographically generated session tokens (`anon_token`) to prevent unauthorized file access.

---

## 🤝 Contributing

We welcome contributions from the open-source community!

1. Fork the Project (`https://github.com/Skedare240507/FileConvert/fork`)
2. Create your Feature Branch (`git checkout -b feat/amazing-feature`)
3. Follow the commit standard:
   - `feat: add support for EPUB to PDF conversion`
   - `fix: resolve memory leak in imageWorker`
   - `docs: update self-hosting guide`
4. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the Branch (`git push origin feat/amazing-feature`)
6. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Maintained with precision by <strong>Sahil</strong> (<a href="https://github.com/Skedare240507">@Skedare240507</a>) and contributors.</sub>
</div>
