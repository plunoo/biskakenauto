# Multi-stage build for Biskaken Auto Shop Management
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for both frontend and backend
COPY package*.json ./
COPY biskaken-auto-api/package*.json ./biskaken-auto-api/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd biskaken-auto-api && npm ci --only=production && npm cache clean --force

# Development dependencies for building
FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY biskaken-auto-api/package*.json ./biskaken-auto-api/

# Install all dependencies (including dev dependencies)
RUN npm ci
RUN cd biskaken-auto-api && npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Build backend
RUN cd biskaken-auto-api && npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./public
COPY --from=builder /app/biskaken-auto-api/dist ./biskaken-auto-api/dist
COPY --from=builder /app/biskaken-auto-api/package*.json ./biskaken-auto-api/
COPY --from=deps /app/biskaken-auto-api/node_modules ./biskaken-auto-api/node_modules

# Copy any additional files needed
COPY --from=builder /app/biskaken-auto-api/prisma ./biskaken-auto-api/prisma

USER nextjs

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "biskaken-auto-api/dist/server.js"]