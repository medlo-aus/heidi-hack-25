# Dockerfile - Skip postinstall scripts and run Prisma generate manually
FROM node:20-alpine

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

# Install dependencies but skip postinstall scripts
RUN pnpm install --no-frozen-lockfile --prefer-offline --ignore-scripts

# Generate Prisma client manually (after dependencies are installed)
RUN pnpm --filter=@heidi/db exec prisma generate

# Build ONLY the Next.js app
RUN pnpm --filter=@heidi/nextjs build

# Expose port
EXPOSE 8080

# Start ONLY the Next.js app
CMD ["pnpm", "--filter=@heidi/nextjs", "start"]