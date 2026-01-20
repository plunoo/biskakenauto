#!/bin/bash

# Test Integrated Setup Locally (without Docker)
echo "🚀 Testing Biskaken Auto Integrated Setup Locally..."

# Set environment variables for integrated setup
export NODE_ENV=production
export PORT=5001
export HOST=0.0.0.0
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=biskaken_auto
export DB_USER=postgres
export DB_PASSWORD=3coinsltd
export JWT_SECRET=biskaken-jwt-secret-2025-integrated
export CORS_ORIGINS="https://biskakenauto.rpnmore.com,http://localhost:3000"
export DEMO_MODE=false

echo "📋 Configuration:"
echo "  PORT: $PORT"
echo "  DB_HOST: $DB_HOST"
echo "  DB_NAME: $DB_NAME"
echo "  DEMO_MODE: $DEMO_MODE"
echo ""

cd server

echo "🔄 Starting integrated backend..."
echo "🌐 Backend will be available at: http://localhost:$PORT"
echo "📊 Health check: http://localhost:$PORT/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node app.js