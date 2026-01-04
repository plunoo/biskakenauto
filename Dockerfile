# Unified Dockerfile for Dokploy Docker Compose deployment
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache bash curl postgresql-client

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY biskaken-auto-api/package*.json ./biskaken-auto-api/

# Install frontend dependencies
RUN npm install

# Copy all source code
COPY . .

# Build frontend
RUN npm run build:frontend

# Move to backend directory and install dependencies
WORKDIR /app/biskaken-auto-api
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build backend TypeScript code
RUN npx tsc

# Copy built frontend to backend public directory
RUN mkdir -p public && cp -r /app/dist/* ./public/

# Create simplified startup script for Docker Compose
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting Biskaken Auto..."
cd /app/biskaken-auto-api

# Wait for database service
echo "⏳ Waiting for database..."
until pg_isready -h db -p 5432 -U postgres; do
  echo "Database not ready, waiting..."
  sleep 3
done
echo "✅ Database connected"

# Run database migrations
echo "🔄 Running migrations..."
npx prisma migrate deploy

# Seed database with initial data
echo "🌱 Seeding database..."
npx prisma db seed || echo "Seed completed"

# Start the server
echo "🌟 Starting server on port 3000..."
exec node dist/server.js
EOF

# Make script executable
RUN chmod +x /app/start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port 3000 (standard for Dokploy)
EXPOSE 3000

# Health check for Docker Compose
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["/app/start.sh"]