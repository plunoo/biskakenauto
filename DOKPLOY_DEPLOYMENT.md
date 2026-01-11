# Dokploy Deployment Guide

## Backend Application Setup

### 1. Create New Application in Dokploy

1. Go to your Dokploy dashboard
2. Click "New Application" 
3. Choose **Application** type (not Docker Compose)
4. Configure as follows:

### 2. Application Configuration

**Source:**
- **Repository**: `https://github.com/plunoo/biskakenauto.git`
- **Branch**: `main`
- **Build Path**: `/server` (important!)

**Build Configuration:**
- **Build Method**: `Dockerfile`
- **Dockerfile Path**: `Dockerfile.dokploy`

**Runtime:**
- **Port**: `5000`
- **Start Command**: `npm run start:dokploy`

### 3. Environment Variables

Set these in Dokploy dashboard:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=[your-postgres-service-name]
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=[your-db-password]
JWT_SECRET=[your-jwt-secret]
CORS_ORIGINS=https://biskakenauto.rpnmore.com
```

### 4. Domain Configuration

1. Enable domain in Dokploy
2. Note the domain assigned (e.g., `backend-xyz.your-domain.com`)
3. Update frontend API configuration to use this domain

### 5. Frontend API Configuration

Update your frontend environment variables:
```env
VITE_API_URL=https://[backend-domain-from-dokploy]
```

## Testing the Deployment

### Backend Endpoints:
```
https://[backend-domain]/health
https://[backend-domain]/api/status
https://[backend-domain]/api/test/endpoints
https://[backend-domain]/api/test/reports/dashboard
```

### Frontend Integration:
- Frontend at: `https://biskakenauto.rpnmore.com`
- Should now connect to backend via the assigned Dokploy domain

## Key Benefits of This Approach:

1. ✅ **Proper Dokploy Application** - Uses single application model
2. ✅ **External Access** - Backend gets its own domain
3. ✅ **Simple Configuration** - Minimal dependencies, fast deployment
4. ✅ **No Database Dependency** - Uses test data initially
5. ✅ **Quick Testing** - Immediate verification possible

## Deployment Steps:

1. **Push this code** to your repository
2. **Create Backend Application** in Dokploy using settings above
3. **Deploy and get domain** assigned by Dokploy
4. **Update Frontend** environment variables with backend domain
5. **Redeploy Frontend** with new backend URL
6. **Test full application** functionality

This approach treats the backend as a standalone Dokploy Application with its own external domain, which is the recommended pattern according to Dokploy documentation.