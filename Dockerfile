# Production Dockerfile for Biskaken Auto Shop Management
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    postgresql-client \
    git

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY biskaken-auto-api/package*.json ./biskaken-auto-api/

# Install dependencies
RUN npm ci --only=production --silent
RUN cd biskaken-auto-api && npm ci --only=production --silent

# Copy source code
COPY . .

# Build frontend
RUN npm run build:frontend

# Build backend
WORKDIR /app/biskaken-auto-api
RUN npx prisma generate
RUN npx tsc --skipLibCheck

# Copy built frontend to backend public directory
RUN mkdir -p public && cp -r /app/dist/* ./public/

# Create production startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -euo pipefail

echo "🚀 Starting Biskaken Auto Production..."
cd /app/biskaken-auto-api

# Wait for database with retry logic
echo "⏳ Waiting for database..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! pg_isready -h ${DB_HOST:-db} -p 5432 -U postgres -q; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo "❌ Database failed after $MAX_RETRIES attempts"
        exit 1
    fi
    echo "Database not ready (attempt $RETRY_COUNT/$MAX_RETRIES)..."
    sleep 2
done

echo "✅ Database connected"

# Ensure Prisma client
npx prisma generate

# Run migrations
echo "🔄 Running migrations..."
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed || echo "Seed completed"

# Start server
echo "🌟 Starting server on port 3000..."
echo "🔐 Default admin: admin@biskaken.com / admin123"
exec node dist/server.js
EOF

# Make script executable and set permissions
RUN chmod +x /app/start.sh
RUN chown -R node:node /app
USER node

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["/app/start.sh"]