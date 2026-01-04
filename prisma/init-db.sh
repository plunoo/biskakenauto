#!/bin/bash
set -e

echo "📊 Initializing Biskaken Auto Database..."

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations or push schema
echo "📈 Setting up database schema..."
if [ "$NODE_ENV" = "production" ]; then
    # In production, use migrations
    npx prisma migrate deploy
else
    # In development, push schema directly
    npx prisma db push
fi

echo "✅ Database schema initialized successfully"

# Optional: Seed database with initial data
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 Seeding database with initial data..."
    npx ts-node prisma/seed.ts || echo "ℹ️  No seed data or seeding failed"
fi

echo "🎯 Database initialization complete!"