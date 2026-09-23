# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

# Install system deps needed at build time (prisma generate needs openssl)
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install production + dev deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --ignore-scripts && npx prisma generate

# ── Stage 2: worker runtime ───────────────────────────────────────────────────
FROM node:20-slim AS worker

WORKDIR /app

# Install ImageMagick + Ghostscript (for PDF → JPG via `magick`) and curl (healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
      imagemagick \
      ghostscript \
      curl \
      openssl \
    && rm -rf /var/lib/apt/lists/*

# ImageMagick's security policy blocks PDF reading by default — allow it
RUN sed -i 's|<policy domain="coder" rights="none" pattern="PDF" />|<policy domain="coder" rights="read|write" pattern="PDF" />|g' \
      /etc/ImageMagick-6/policy.xml || true

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Copy source code
COPY . .

# tsx is already in devDependencies — run via node_modules/.bin
ENV NODE_ENV=production

CMD ["node_modules/.bin/tsx", "backend/workers/orchestrator.ts"]
