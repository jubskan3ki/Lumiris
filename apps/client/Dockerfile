# syntax=docker/dockerfile:1.7
# ─────────────────────────────────────────────────────────────────────────────
# LUMIRIS · @lumiris/client — multi-stage Bun image
# Build context MUST be the monorepo root.
#   docker build -f apps/client/Dockerfile -t lumiris-client:$(git rev-parse --short HEAD) .
# ─────────────────────────────────────────────────────────────────────────────

ARG BUN_VERSION=1.1.38
ARG NODE_VERSION=22

FROM oven/bun:${BUN_VERSION}-alpine AS deps
WORKDIR /repo

COPY package.json bun.lockb* bunfig.toml turbo.json tsconfig.base.json ./
COPY apps/admin/package.json apps/admin/
COPY apps/client/package.json apps/client/
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

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/client/node_modules ./apps/client/node_modules
COPY . .

RUN bun run --filter @lumiris/client build

FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12:nonroot AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3003
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chown=nonroot:nonroot /repo/apps/client/.next/standalone ./
COPY --from=build --chown=nonroot:nonroot /repo/apps/client/.next/static ./apps/client/.next/static
COPY --from=build --chown=nonroot:nonroot /repo/apps/client/public ./apps/client/public

USER nonroot
EXPOSE 3003
CMD ["apps/client/server.js"]
