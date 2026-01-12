#!/bin/bash

# Biskaken Auto Admin Dashboard - Frontend Deployment Script
set -e

echo "🚀 Deploying Biskaken Auto Admin Dashboard..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build -f Dockerfile.frontend -t biskaken-admin-frontend:latest .

echo -e "${BLUE}🔍 Testing built image...${NC}"
# Quick test to ensure image builds and runs
docker run --rm -d --name test-frontend -p 8080:80 biskaken-admin-frontend:latest
sleep 5

echo -e "${BLUE}🩺 Running health check...${NC}"
if curl -f http://localhost:8080/health; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    docker stop test-frontend
    exit 1
fi

echo -e "${BLUE}🛑 Stopping test container...${NC}"
docker stop test-frontend

echo -e "${GREEN}✅ Frontend build successful!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Push image to registry (if using external registry)"
echo "2. Deploy using Dokploy application service"
echo "3. Configure domain and environment variables"
echo "4. Test admin dashboard access"

echo -e "${BLUE}🔧 Dokploy Configuration:${NC}"
echo "- Service Type: Application"
echo "- Build Context: Current directory"
echo "- Dockerfile: Dockerfile.frontend"
echo "- Container Port: 80"
echo "- Health Check: /health"

echo -e "${GREEN}🎉 Ready for Dokploy deployment!${NC}"