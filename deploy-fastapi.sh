#!/bin/bash
set -e

echo "🚀 Deploying FastAPI Backend to Dokploy..."

# Push changes to repository
echo "📤 Pushing FastAPI backend to repository..."
git push origin v5-complete-ai-system

echo "✅ FastAPI backend pushed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Dokploy dashboard"
echo "2. Update the backend service to use the fastapi-backend directory"
echo "3. Set Dockerfile path to: fastapi-backend/Dockerfile.integrated"
echo "4. Set build context to: fastapi-backend"
echo "5. Environment variables:"
echo "   - DATABASE_URL=postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto"
echo "   - JWT_SECRET=biskaken-super-secure-jwt-secret-2026-v5"
echo ""
echo "🔧 FastAPI Backend Configuration:"
echo "   - Port: 5000"
echo "   - Health Check: /health"
echo "   - Admin Login: admin@biskaken.com / admin123"
echo "   - Database Status: /api/db-status"