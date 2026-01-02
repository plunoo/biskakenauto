#!/bin/bash

# =============================================================================
# Biskaken Auto Shop Management - Production Deployment Script
# =============================================================================

set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if backend directory exists
if [ ! -d "biskaken-auto-api" ]; then
    echo "❌ Error: biskaken-auto-api directory not found."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm ci

echo "📦 Installing backend dependencies..."
cd biskaken-auto-api
npm ci
cd ..

echo "🏗️ Building frontend..."
npm run build

echo "🏗️ Building backend..."
cd biskaken-auto-api
npm run build
cd ..

echo "📁 Preparing static files..."
# Create public directory if it doesn't exist
mkdir -p biskaken-auto-api/public
# Copy frontend build to backend public folder
cp -r dist/* biskaken-auto-api/public/

echo "🗄️ Setting up database..."
cd biskaken-auto-api
npm run db:generate || echo "⚠️ Database generation skipped (set DATABASE_URL first)"
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "📋 Deployment checklist:"
echo "  1. Set all required environment variables in .env"
echo "  2. Configure DATABASE_URL for PostgreSQL"
echo "  3. Set GEMINI_API_KEY for AI features"
echo "  4. Configure PAYSTACK keys for payments"
echo "  5. Set TWILIO credentials for SMS"
echo "  6. Set NODE_ENV=production"
echo "  7. Set APP_URL to your domain"
echo ""
echo "🚀 To start in production: cd biskaken-auto-api && npm start"
echo ""
echo "🌐 Your app will be available at: ${APP_URL:-https://rpnmore.biskakenauto.com}"