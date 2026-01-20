#!/bin/bash

# Biskaken Auto - Integrated Backend + Database Deployment Script

echo "🚀 Starting Biskaken Auto Integrated Deployment..."

# Load environment variables
if [ -f .env.integrated ]; then
    export $(cat .env.integrated | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  No .env.integrated file found, using defaults"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.integrated.yml down --remove-orphans

# Remove old images (optional - uncomment if needed)
# echo "🗑️  Removing old images..."
# docker-compose -f docker-compose.integrated.yml down --rmi all

# Build and start containers
echo "🔨 Building and starting integrated containers..."
docker-compose -f docker-compose.integrated.yml up --build -d

# Check container status
echo "📊 Container Status:"
docker-compose -f docker-compose.integrated.yml ps

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo "🏥 Health Check:"
curl -f http://localhost:5000/health && echo "✅ Backend healthy" || echo "❌ Backend health check failed"

echo "🎉 Integrated deployment complete!"
echo "🌐 Backend API: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📋 Quick Commands:"
echo "  View logs: docker-compose -f docker-compose.integrated.yml logs -f"
echo "  Stop: docker-compose -f docker-compose.integrated.yml down"
echo "  Restart: docker-compose -f docker-compose.integrated.yml restart"