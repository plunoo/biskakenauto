#!/bin/sh

echo "🚀 Starting Biskaken Auto Services..."
echo "📂 Working directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

echo "🔍 Checking for server file:"
ls -la dist/server.js

echo "🌐 Environment:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

echo "🔗 Starting Node.js server..."
exec node dist/server.js