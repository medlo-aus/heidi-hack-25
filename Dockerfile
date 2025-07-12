# Multi-stage Dockerfile - Build with full Node.js, run with Alpine
FROM node:20 AS builder

# Install pnpm
RUN npm install -g pnpm@9.7.1 && corepack enable

WORKDIR /app

# Copy everything
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true
ENV PORT=8080

# Install dependencies (Python available in full Node.js image)
RUN pnpm install --no-frozen-lockfile --prefer-offline

# Build ONLY the Next.js app
RUN pnpm --filter=@heidi/nextjs build

# Production stage - Use Alpine for smaller final image
FROM node:20-alpine AS runner

# Install pnpm
RUN npm install -g pnpm@9.7.1 && corepack enable

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/.next/static ./apps/nextjs/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/nextjs/public ./apps/nextjs/public

# Copy necessary packages for runtime
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

USER nextjs

EXPOSE 8080

# Start the Next.js app
CMD ["node", "apps/nextjs/server.js"]