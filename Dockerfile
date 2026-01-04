# Simple Single-Stage Dockerfile for Biskaken Auto
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache bash curl postgresql-client

WORKDIR /app

# Copy all source files
COPY . .

# Install frontend dependencies and build frontend
RUN npm install
RUN npm run build:frontend

# Install backend dependencies  
WORKDIR /app/biskaken-auto-api
RUN npm install

# Copy prisma schema and generate client
RUN npx prisma generate

# Build backend
RUN npm run build

# Copy built frontend to backend public directory
RUN mkdir -p public && cp -r /app/dist/* ./public/

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting Biskaken Auto Production Server..."

# Change to backend directory
cd /app/biskaken-auto-api

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until pg_isready -h ${DB_HOST:-postgres} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres}; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "✅ Database connection established"

# Generate Prisma client (ensure it's available)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed database with initial data if needed
echo "🌱 Seeding database..."
npx prisma db seed || echo "Seed completed or already exists"

# Start the server
echo "🌟 Starting application server..."
exec node dist/server.js
EOF

RUN chmod +x /app/start.sh

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV APP_URL=https://biskakenauto.rpnmore.com

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000

# Start application
CMD ["/app/start.sh"]