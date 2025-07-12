# Complete Google Cloud Run Dockerfile for heidi-hack-25
# FIXED: Handles .npmrc configuration properly

FROM node:20-alpine AS base

# Install system dependencies required for Alpine and Google Cloud Run
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Install pnpm globally with exact version from your project
RUN npm install -g pnpm@9.7.1 && corepack enable

# Set working directory
WORKDIR /app

# Set base environment variables for Google Cloud Run
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Dependencies stage - Install all dependencies
FROM base AS deps

# IMPORTANT: Copy .npmrc FIRST to ensure pnpm uses correct configuration
COPY .npmrc ./

# Copy pnpm configuration files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Copy all package.json files for workspace dependencies
COPY apps/nextjs/package.json ./apps/nextjs/
COPY packages/db/package.json ./packages/db/
COPY packages/validators/package.json ./packages/validators/

# Copy tooling package.json files if they exist
COPY tooling/*/package.json ./tooling/*/

# Install dependencies with correct configuration
# Using --no-frozen-lockfile to handle config mismatch
RUN pnpm install --no-frozen-lockfile --prefer-offline

# Builder stage - Build the application
FROM base AS builder

# Copy node_modules from deps stage for better caching
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/nextjs/node_modules ./apps/nextjs/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/validators/node_modules ./packages/validators/node_modules

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true
ENV CI=true

# Build shared packages first (respecting dependency order)
RUN pnpm --filter=@heidi/validators build 2>/dev/null || echo "No validators build script"
RUN pnpm --filter=@heidi/db build 2>/dev/null || echo "No db build script"

# Generate Prisma client if needed
RUN pnpm --filter=@heidi/db db:generate 2>/dev/null || echo "No Prisma generation needed"

# Build the Next.js application using Turborepo
RUN pnpm turbo build --filter=@heidi/nextjs

# Verify the build output exists
RUN ls -la /app/apps/nextjs/.next/

# Production stage - Minimal runtime image for Google Cloud Run
FROM base AS runner

# Create non-root user for security (required for production)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment variables optimized for Google Cloud Run
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Google Cloud Run specific optimizations
ENV GOOGLE_CLOUD_PROJECT_ID=""
ENV GOOGLE_CLOUD_REGION=""
ENV K_SERVICE=""
ENV K_CONFIGURATION=""
ENV K_REVISION=""

# Copy built Next.js application using standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/public ./apps/nextjs/public

# Copy necessary shared packages for runtime
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# Copy environment file if it exists (optional)
COPY --from=builder --chown=nextjs:nodejs /app/.env ./.env 2>/dev/null || true

# Copy pnpm workspace configuration for runtime
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Switch to non-root user for security
USER nextjs

# Expose port 8080 (Google Cloud Run default)
EXPOSE 8080

# Health check for Google Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Start the application with proper signal handling
# Using dumb-init for proper signal handling in containerized environment
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/nextjs/server.js"]