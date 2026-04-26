# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# LUMIRIS · @lumiris/mobile — PWA build (Tauri shell built separately)
# Build context MUST be the monorepo root.
#   docker build -f apps/mobile/Dockerfile -t lumiris-mobile:$(git rev-parse --short HEAD) .
# ─────────────────────────────────────────────────────────────────────────────

ARG BUN_VERSION=1.1.38
ARG NODE_VERSION=22

FROM oven/bun:${BUN_VERSION}-alpine AS deps
WORKDIR /repo

COPY package.json bun.lockb* bunfig.toml turbo.json tsconfig.base.json ./
COPY apps/admin/package.json apps/admin/
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY apps/api/package.json apps/api/
COPY packages/ui/package.json packages/ui/
COPY packages/core/package.json packages/core/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
COPY packages/utils/package.json packages/utils/
COPY packages/telemetry/package.json packages/telemetry/
COPY packages/mock-data/package.json packages/mock-data/
COPY packages/scoring-ui/package.json packages/scoring-ui/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --ignore-scripts

FROM oven/bun:${BUN_VERSION}-alpine AS build
WORKDIR /repo
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Web/PWA build path — Tauri static export uses bun run build:tauri locally.
ENV BUILD_TARGET=web

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/mobile/node_modules ./apps/mobile/node_modules
COPY . .

RUN bun run --filter @lumiris/mobile build

FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12:nonroot AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chown=nonroot:nonroot /repo/apps/mobile/.next/standalone ./
COPY --from=build --chown=nonroot:nonroot /repo/apps/mobile/.next/static ./apps/mobile/.next/static
COPY --from=build --chown=nonroot:nonroot /repo/apps/mobile/public ./apps/mobile/public

USER nonroot
EXPOSE 3002
CMD ["apps/mobile/server.js"]
