# 🚀 Biskaken Auto Admin Dashboard - Dokploy Deployment

## Overview
This guide covers deploying the Biskaken Auto admin dashboard (React frontend) to Dokploy as a separate service.

## 📦 What's Being Deployed
- React-based admin dashboard
- Built with Vite for optimal performance
- Nginx serving static files
- Health check endpoint at `/health`

## 🏗 Architecture
```
[Internet] → [Dokploy Proxy] → [Admin Dashboard:3000]
                                      ↓ (internal API calls)
                                [Backend API:5000]
```

## 🚀 Deployment Options

### Option 1: Dokploy Application Service (Recommended)
1. **Create New Application Service**
   - Service Type: Application
   - Name: `biskaken-admin-dashboard`
   
2. **Build Configuration**
   - Upload root directory (exclude `server/` folder)
   - Dockerfile: `Dockerfile.frontend`
   - Build context: Root directory
   
3. **Container Configuration**
   - Container Port: `80`
   - Public Domain: Your desired domain (e.g., `admin.yourdomain.com`)
   
4. **Environment Variables**
   ```env
   NODE_ENV=production
   ```

5. **Health Check**
   - Path: `/health`
   - Port: 80

### Option 2: Docker Compose
Use the provided `dokploy.frontend.yml`:

```bash
docker-compose -f dokploy.frontend.yml up -d
```

## 🔧 Configuration Details

### Dockerfile Features
- **Multi-stage build** for optimized image size
- **Nginx Alpine** for efficient static file serving
- **SPA routing support** with fallback to index.html
- **Health check endpoint** for monitoring

### Environment Variables
The frontend is configured to work with:
- **API Base URL**: Should be configured in your Dokploy environment
- **Production optimizations**: Enabled by default

## 🌐 API Integration
The admin dashboard needs to connect to your backend API. Configure the API URL in one of these ways:

1. **Environment Variable** (if using API service discovery):
   ```env
   VITE_API_URL=http://backend:5000
   ```

2. **Direct Domain** (if backend has public domain):
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

## 📊 Default Admin Access
- **Email**: `admin@biskaken-v3.com`
- **Password**: `admin123`
- **⚠️ Change immediately after deployment!**

## 🔍 Verification Steps

1. **Health Check**
   ```bash
   curl https://your-admin-domain.com/health
   # Should return: OK
   ```

2. **Admin Dashboard**
   - Navigate to your admin domain
   - Should load the login page
   - Login with default credentials
   - Verify dashboard loads properly

3. **API Connectivity**
   - Check if dashboard can connect to backend
   - Verify data loads in dashboard sections
   - Test CRUD operations

## 🔧 Troubleshooting

### Common Issues:

**1. Dashboard loads but no data:**
- Check API URL configuration
- Verify backend service is running
- Check CORS settings on backend

**2. 404 errors on page refresh:**
- Nginx SPA routing is configured in Dockerfile
- Verify Nginx config is correct

**3. Build failures:**
- Ensure all dependencies are in package.frontend.json
- Check TypeScript compilation errors
- Verify Vite configuration

**4. Container won't start:**
- Check port 80 is not in use
- Verify Docker build completed successfully
- Check container logs for errors

### Debug Commands:
```bash
# Check container status
docker ps | grep biskaken-admin

# View container logs
docker logs <container-id>

# Test health endpoint
curl http://localhost:3000/health
```

## 📝 Files Created
- `Dockerfile.frontend` - Multi-stage Docker build
- `package.frontend.json` - Frontend dependencies
- `dokploy.frontend.yml` - Docker Compose configuration
- `FRONTEND_DEPLOYMENT.md` - This deployment guide

## 🔄 Next Steps
1. Deploy the frontend using your chosen method
2. Configure your domain/subdomain
3. Update API URL configuration
4. Test admin dashboard functionality
5. Change default admin credentials

Your Biskaken Auto admin dashboard will be ready for use! 🎉