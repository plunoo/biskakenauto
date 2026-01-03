# Multi-stage build for Biskaken Auto Shop Management
FROM node:18-alpine AS base

# Install necessary packages
RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY biskaken-auto-api/package*.json ./biskaken-auto-api/

# Install dependencies (including dev dependencies for build)
RUN npm ci
RUN cd biskaken-auto-api && npm ci

# Build the source code
FROM base AS builder
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/biskaken-auto-api/node_modules ./biskaken-auto-api/node_modules

# Copy source code
COPY . .

# Build frontend only
RUN npm run build:frontend

# Frontend-only nginx image
FROM nginx:alpine AS frontend
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Full-stack production image (default)
FROM base AS fullstack
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Build backend for fullstack
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/biskaken-auto-api/node_modules ./biskaken-auto-api/node_modules
COPY . .
RUN cd biskaken-auto-api && npm run build
RUN mkdir -p biskaken-auto-api/public && cp -r dist/* biskaken-auto-api/public/

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/biskaken-auto-api/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/biskaken-auto-api/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/biskaken-auto-api/package*.json ./
COPY --from=deps --chown=nextjs:nodejs /app/biskaken-auto-api/node_modules ./node_modules

# Copy prisma if exists
COPY --from=builder --chown=nextjs:nodejs /app/biskaken-auto-api/prisma ./prisma

USER nextjs

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "http.get('http://localhost:5000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/server.js"]