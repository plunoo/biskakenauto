#!/bin/bash
set -e

# Production startup script for Biskaken Auto Shop Management

echo "🚀 Starting Biskaken Auto Shop Management..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Starting from wrong directory."
    exit 1
fi

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-5000}

echo "🌍 Environment: $NODE_ENV"
echo "📡 Port: $PORT"

# Start the application
echo "🏃 Starting server..."
exec node dist/server.js