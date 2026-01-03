# Backend-Only Dockerfile for Step-by-Step Deployment
# Deploy this first to test API endpoints
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    bash \
    curl \
    libc6-compat

# Copy backend source
COPY biskaken-auto-api ./

# Install dependencies
RUN npm ci

# Generate Prisma client and build backend
RUN npx prisma generate
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 backend

# Set permissions
RUN chown -R backend:nodejs /app

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Default credentials for testing
ENV ADMIN_EMAIL="admin@biskaken.com"
ENV ADMIN_PASSWORD="admin123"
ENV JWT_SECRET="backend-only-jwt-secret-change-in-production"

# Default database URL using SQLite for backend-only deployment
ENV DATABASE_URL="file:./dev.db"

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start backend server
USER backend
CMD ["npm", "start"]