#!/bin/bash

# 🚀 Biskaken Auto Admin - Automated Deployment Script
# This script automates the deployment process for Dokploy

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local required_files=(
        "dokploy-admin.yml"
        "api/main.py"
        "api/requirements.txt"
        "api/Dockerfile"
        "api/init.sql"
        "nginx.conf"
        "docker-entrypoint.sh"
        "env.production.example"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "All required files found"
}

# Validate environment variables
check_environment() {
    print_status "Checking environment variables..."
    
    if [[ -z "$DB_PASSWORD" ]]; then
        print_error "DB_PASSWORD environment variable is required"
        print_warning "Please set it: export DB_PASSWORD='your_secure_password'"
        exit 1
    fi
    
    if [[ ${#DB_PASSWORD} -lt 8 ]]; then
        print_error "DB_PASSWORD must be at least 8 characters long"
        exit 1
    fi
    
    print_success "Environment variables validated"
}

# Build and test containers locally
build_containers() {
    print_status "Building containers for testing..."
    
    # Build API container
    print_status "Building FastAPI container..."
    docker build -t biskaken-api:test ./api/
    
    # Build frontend container  
    print_status "Building frontend container..."
    docker build -t biskaken-frontend:test -f Dockerfile.admin .
    
    print_success "Containers built successfully"
}

# Test database connection
test_database() {
    print_status "Testing database setup..."
    
    # Start temporary PostgreSQL container for testing
    docker run -d --name test-postgres \
        -e POSTGRES_DB=biskaken_auto \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD="$DB_PASSWORD" \
        -v "$(pwd)/api/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" \
        postgres:15-alpine
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Test connection
    if docker exec test-postgres psql -U postgres -d biskaken_auto -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
        print_success "Database setup test passed"
    else
        print_error "Database setup test failed"
        docker logs test-postgres
        docker rm -f test-postgres
        exit 1
    fi
    
    # Cleanup test container
    docker rm -f test-postgres
}

# Generate docker-compose file with environment variables
generate_compose() {
    print_status "Generating production docker-compose file..."
    
    # Create production compose file with substituted variables
    envsubst < dokploy-admin.yml > dokploy-admin.prod.yml
    
    print_success "Production compose file generated: dokploy-admin.prod.yml"
}

# Deploy to Dokploy (if CLI is available)
deploy_to_dokploy() {
    if command -v dokploy &> /dev/null; then
        print_status "Deploying to Dokploy..."
        
        # Deploy using Dokploy CLI
        dokploy compose up -f dokploy-admin.prod.yml -p biskaken-admin
        
        print_success "Deployment initiated via Dokploy CLI"
    else
        print_warning "Dokploy CLI not found. Please deploy manually:"
        echo "1. Upload dokploy-admin.yml to your Dokploy dashboard"
        echo "2. Set environment variables in Dokploy"
        echo "3. Deploy the stack"
    fi
}

# Health check after deployment
health_check() {
    local base_url="https://bisadmin.rpnmore.com"
    
    print_status "Performing health checks..."
    
    # Wait a bit for services to start
    sleep 30
    
    # Check API health
    if curl -f "$base_url/health" > /dev/null 2>&1; then
        print_success "API health check passed"
    else
        print_warning "API health check failed - services may still be starting"
    fi
    
    # Check database connection
    if curl -f "$base_url/api/db-status" > /dev/null 2>&1; then
        print_success "Database connection check passed"
    else
        print_warning "Database connection check failed - services may still be starting"
    fi
    
    # Check frontend
    if curl -f "$base_url/" > /dev/null 2>&1; then
        print_success "Frontend check passed"
    else
        print_warning "Frontend check failed - services may still be starting"
    fi
}

# Main deployment function
main() {
    echo "🚀 Biskaken Auto Admin - Automated Deployment"
    echo "============================================="
    
    # Set default environment variables if not provided
    export DB_HOST="${DB_HOST:-biskaken-postgres}"
    export DB_PORT="${DB_PORT:-5432}"
    export DB_NAME="${DB_NAME:-biskaken_auto}"
    export DB_USER="${DB_USER:-postgres}"
    export VITE_API_URL="${VITE_API_URL:-https://bisadmin.rpnmore.com}"
    export VITE_APP_TITLE="${VITE_APP_TITLE:-Biskaken Auto Admin}"
    export VITE_ENVIRONMENT="${VITE_ENVIRONMENT:-production}"
    export NODE_ENV="${NODE_ENV:-production}"
    export ENVIRONMENT="${ENVIRONMENT:-production}"
    export PORT="${PORT:-8000}"
    
    # Run deployment steps
    check_prerequisites
    check_environment
    
    if [[ "$1" == "--local-test" ]]; then
        print_status "Running local tests only..."
        build_containers
        test_database
        print_success "Local tests completed successfully"
        exit 0
    fi
    
    build_containers
    test_database
    generate_compose
    deploy_to_dokploy
    
    print_success "Deployment process completed!"
    echo ""
    echo "🎉 Your admin dashboard should be available at:"
    echo "   https://bisadmin.rpnmore.com"
    echo ""
    echo "📋 Default login credentials:"
    echo "   Email: admin@biskaken.com"  
    echo "   Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Change the default password immediately!"
    echo ""
    echo "🔍 To check deployment status:"
    echo "   curl https://bisadmin.rpnmore.com/health"
    echo ""
    
    # Run health checks
    if [[ "$2" != "--no-health-check" ]]; then
        health_check
    fi
}

# Show usage if no arguments provided
if [[ $# -eq 0 ]]; then
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --local-test           Run local tests only (don't deploy)"
    echo "  --no-health-check      Skip health checks after deployment"
    echo ""
    echo "Environment variables required:"
    echo "  DB_PASSWORD            Database password (required)"
    echo ""
    echo "Example:"
    echo "  export DB_PASSWORD='my_secure_password_123'"
    echo "  $0"
    echo ""
    exit 1
fi

# Run main function
main "$@"