# ============================================================
# Multi-stage Dockerfile template for static frontends (SPA)
# Build with Node → serve via NGINX
#
# Usage:
#   docker build -t ghcr.io/<org>/<repo>:<tag> \
#     --build-arg VITE_BASE=/ \
#     .
#
# Make sure you also have a proper .dockerignore (node_modules, dist, etc.)
# ============================================================

########## 1) Build stage #####################################################
FROM node:20-alpine AS build
WORKDIR /app

# Copy only manifest files first to enable layer caching for deps
# [CHANGE ME] If you use pnpm/yarn, change these patterns accordingly.
COPY package*.json ./
# [OPTIONAL] For pnpm: COPY pnpm-lock.yaml ./
# [OPTIONAL] For yarn: COPY yarn.lock ./

# Faster installs + cache your npm store between builds
# Requires BuildKit (docker buildx). If not using BuildKit, remove the --mount.
# [CHANGE ME] Switch npm ci → pnpm i --frozen-lockfile or yarn --frozen-lockfile as needed.
# RUN --mount=type=cache,target=/root/.npm npm ci

# Now copy the rest of your source
# [CHANGE ME] Ensure your project actually outputs to /dist (or update below).
COPY . .

# [OPTIONAL] Build-time args for tools like Vite/Next/Gatsby/etc.
# Example: --build-arg VITE_BASE=/app/
# Access via process.env.* or import.meta.env in your toolchain.
ARG VITE_BASE=/
ENV VITE_BASE=${VITE_BASE}

# [CHANGE ME] Replace with your actual build command
# e.g., npm run build, pnpm build, yarn build


########## 2) Runtime stage (static file server) ##############################
FROM nginx:1.27-alpine

# [CHANGE ME] Provide an NGINX config that:
#   - Serves your SPA files from /usr/share/nginx/html
#   - Returns index.html for unknown routes (history fallback)
#   - Exposes a simple /healthz endpoint (or adjust HEALTHCHECK below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the previous stage
# [CHANGE ME] If your build output dir isn't /dist, update this path.
COPY --from=build /app/dist /usr/share/nginx/html

# [OPTIONAL] Run as non-root (hardened)
# Note: NGINX official image uses user 101:101 in some variants; verify paths/ports.
# USER 101:101

EXPOSE 80

# Health check
# By default, checks /healthz. Your nginx.conf should return 200 "ok" on /healthz.
# [CHANGE ME] If you don't have /healthz, switch to "/" or an asset path that exists,
# and/or swap wget → curl -f (alpine curl is in curl package).
# Also: yes, this runs every 30s with a 3s timeout and 3 retries before unhealthy.
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost/healthz || exit 1

# ----------------------- Notes for Other Repos -------------------------------
# - Node version:    [CHANGE ME] pin to the version your repo supports (e.g., node:22-alpine).
# - Package manager: [CHANGE ME] npm → pnpm/yarn with matching install/build commands.
# - Build output:    [CHANGE ME] if your framework outputs to ".next/out", "build", "public", etc.
# - Env vars:        [CHANGE ME] add ARG/ENV for anything your build needs (API base, base path).
# - NGINX config:    [CHANGE ME] ensure SPA fallback and /healthz route exist as expected.
# - Non-root:        [OPTIONAL] enable USER + fix permissions/ports if your environment requires it.
# - Caching:         Requires BuildKit for --mount cache;
