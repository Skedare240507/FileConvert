# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-slim AS deps

WORKDIR /app

# Install system deps needed at build time (prisma generate needs openssl)
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install production + dev deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --ignore-scripts --legacy-peer-deps && npx prisma generate

# ── Stage 2: worker runtime ───────────────────────────────────────────────────
FROM node:22-slim AS worker

WORKDIR /app

# Install ImageMagick + Ghostscript (for PDF → JPG via `convert`), pdftoppm (poppler-utils)
RUN apt-get update && apt-get install -y --no-install-recommends \
      imagemagick \
      ghostscript \
      poppler-utils \
      openssl \
    && rm -rf /var/lib/apt/lists/*

# ImageMagick's security policy blocks PDF reading by default — allow it, but add basic resource limits
RUN sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/g' /etc/ImageMagick-6/policy.xml || true && \
    sed -i 's/name="memory" value="256MiB"/name="memory" value="1GiB"/g' /etc/ImageMagick-6/policy.xml || true

# Copy installed node_modules from deps stage
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
# Prisma 7 no longer outputs to .prisma by default but leaving it just in case


# Copy source code
COPY --chown=node:node . .

# Run as non-root user
USER node

# tsx is already in devDependencies — run via node_modules/.bin
ENV NODE_ENV=production

CMD ["node_modules/.bin/tsx", "backend/workers/orchestrator.ts"]
