#!/bin/bash

echo "🚀 Biskaken Auto Backend Deployment Script"
echo "========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t biskaken-auto-backend:latest .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "📦 Image: biskaken-auto-backend:latest"
    echo ""
    echo "🔧 To run locally with environment variables:"
    echo "docker run -d --name biskaken-backend \\"
    echo "  -p 5000:5000 \\"
    echo "  -e NODE_ENV=production \\"
    echo "  -e DB_HOST=your_postgres_host \\"
    echo "  -e DB_NAME=biskaken_auto \\"
    echo "  -e DB_USER=your_db_user \\"
    echo "  -e DB_PASSWORD=your_db_password \\"
    echo "  -e JWT_SECRET=your_jwt_secret \\"
    echo "  biskaken-auto-backend:latest"
    echo ""
    echo "🌐 For Dokploy deployment:"
    echo "1. Push this image to your container registry"
    echo "2. Configure environment variables in Dokploy"
    echo "3. Set up PostgreSQL database"
    echo "4. Deploy the application"
    echo ""
    echo "📚 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Docker build failed!"
    exit 1
fi