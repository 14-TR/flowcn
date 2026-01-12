# Multi-stage Dockerfile for flowcn development and production

FROM node:20-alpine AS base

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@8.14.0 --activate

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./

# Development stage
FROM base AS dev

# Install dependencies
COPY packages/core/package.json ./packages/core/
COPY packages/react/package.json ./packages/react/
COPY apps/demo/package.json ./apps/demo/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set environment for file watching in Docker
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["pnpm", "dev"]

# Build stage
FROM base AS builder

COPY packages/core/package.json ./packages/core/
COPY packages/react/package.json ./packages/react/
COPY apps/demo/package.json ./apps/demo/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Production stage
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@8.14.0 --activate

WORKDIR /app

COPY --from=builder /app/apps/demo/.next ./apps/demo/.next
COPY --from=builder /app/apps/demo/public ./apps/demo/public
COPY --from=builder /app/apps/demo/package.json ./apps/demo/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["pnpm", "--filter", "demo", "start"]
