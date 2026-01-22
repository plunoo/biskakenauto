#!/bin/bash

# FastAPI Deployment Script for Dokploy
echo "🚀 Deploying FastAPI Backend to Dokploy..."

# Configuration
REPO_URL="https://github.com/plunoo/biskakenauto.git"
BRANCH="v5-complete-ai-system"

echo "📦 Repository: $REPO_URL"
echo "🌿 Branch: $BRANCH"

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Production mode detected"
    # Use PostgreSQL database
    export DATABASE_URL="postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto"
    export PORT=5000
else
    echo "🛠️ Development mode"
    # Use SQLite for development
    export DATABASE_URL="sqlite:///./test.db"
    export PORT=5002
fi

echo "🔧 Environment:"
echo "  - DATABASE_URL: $DATABASE_URL"
echo "  - PORT: $PORT"
echo "  - JWT_SECRET: [HIDDEN]"

# Start FastAPI server
echo "▶️ Starting FastAPI server..."
cd fastapi-backend
python main.py