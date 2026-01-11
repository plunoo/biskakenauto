# 🐳 Dokploy Internal Container Deployment Guide

## Overview
Your Biskaken Auto application is configured for **internal container communication** within Dokploy. The frontend at https://biskakenauto.rpnmore.com will communicate with the backend via internal Docker networking.

## 🏗 Architecture
```
[Internet] → [Dokploy Proxy] → [Frontend Container:3000]
                                      ↓ (internal)
                                [Backend Container:5000]
                                      ↓ (internal)  
                                [PostgreSQL Container:5432]
```

## 📦 Deployment Structure

### Option 1: Single Project with Docker Compose
Use the provided `docker-compose.dokploy.yml` for complete stack deployment.

### Option 2: Separate Services (Recommended)
Deploy as separate Dokploy services for better management:

#### 🗄️ **1. PostgreSQL Database Service**
- **Service Type**: Database
- **Image**: `postgres:15-alpine`
- **Environment Variables**:
  ```env
  POSTGRES_DB=biskaken_auto
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=your_secure_password
  ```
- **Volume**: `/var/lib/postgresql/data`
- **Internal Name**: `postgres`

#### 🔧 **2. Backend API Service**
- **Service Type**: Application
- **Build**: Upload `/server` directory
- **Container Port**: `5000`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=5000
  HOST=0.0.0.0
  
  # Database Connection (Internal)
  DB_HOST=postgres
  DB_PORT=5432
  DB_NAME=biskaken_auto
  DB_USER=postgres
  DB_PASSWORD=your_secure_password
  DB_SSL=false
  
  # Security
  JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
  
  # CORS (Frontend domain)
  CORS_ORIGINS=https://biskakenauto.rpnmore.com,http://frontend:3000
  ```
- **Internal Name**: `backend`
- **Health Check**: `/health`

#### 🌐 **3. Frontend Service**
- **Service Type**: Application
- **Build**: Upload root directory (with React app)
- **Container Port**: `3000`
- **Public Domain**: `biskakenauto.rpnmore.com`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=3000
  
  # Internal Backend Communication
  VITE_API_URL=http://backend:5000
  VITE_APP_URL=https://biskakenauto.rpnmore.com
  ```

## 🔧 Configuration Files

### Backend Environment (Use in Dokploy)
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=postgres
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_SSL=false
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
CORS_ORIGINS=https://biskakenauto.rpnmore.com,http://frontend:3000
```

### Frontend Environment (Use in Dokploy)
```env
NODE_ENV=production
PORT=3000
VITE_API_URL=http://backend:5000
VITE_APP_URL=https://biskakenauto.rpnmore.com
```

## 🚀 Deployment Steps

### Step 1: Deploy Database
1. Create new PostgreSQL service in Dokploy
2. Set environment variables
3. Create volume for data persistence
4. Deploy and wait for healthy status

### Step 2: Deploy Backend
1. Create new application service
2. Upload `/server` directory
3. Set environment variables (use database service name as `DB_HOST`)
4. Set internal service name to `backend`
5. Deploy and verify health endpoint

### Step 3: Deploy Frontend
1. Create new application service
2. Upload root directory
3. Set environment variables (use backend service name in `VITE_API_URL`)
4. Configure domain `biskakenauto.rpnmore.com`
5. Deploy

## 🔐 Default Admin Access
- **Email**: `admin@biskaken-v3.com`
- **Password**: `admin123`
- **⚠️ Change immediately after deployment!**

## 📊 Verification

### Backend Health Check
Internal: `http://backend:5000/health` (from frontend container)

### API Endpoints
All API calls from frontend will use: `http://backend:5000/api/*`

### Database Connection
Backend connects to: `postgresql://postgres:password@postgres:5432/biskaken_auto`

## 🌐 Internal Container Communication

### How It Works:
1. **Frontend** runs on `frontend:3000`
2. **Backend** runs on `backend:5000` 
3. **Database** runs on `postgres:5432`
4. **Public traffic** → Dokploy proxy → Frontend container
5. **API calls** → Frontend container → Backend container (internal)
6. **Database queries** → Backend container → PostgreSQL container (internal)

### Benefits:
✅ **No external backend domain needed**
✅ **Faster internal network communication**
✅ **Better security** (backend not exposed to internet)
✅ **Simplified SSL management** (only frontend needs SSL)
✅ **Container orchestration** by Dokploy

## 🔍 Troubleshooting

### Common Issues:

**1. Frontend can't reach backend:**
- Check `VITE_API_URL=http://backend:5000` in frontend env
- Verify backend service name is exactly `backend`
- Check both containers are in same Dokploy project

**2. Backend can't reach database:**
- Check `DB_HOST=postgres` in backend env
- Verify PostgreSQL service name is exactly `postgres`
- Check database is running and healthy

**3. CORS errors:**
- Verify `CORS_ORIGINS` includes your frontend domain
- Check internal container name `http://frontend:3000` is allowed

### Debug Commands:
```bash
# Check container connectivity (from inside containers)
curl http://backend:5000/health
curl http://postgres:5432
```

## 📝 Environment Variables Summary

**Required for Backend:**
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=postgres
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret
```

**Required for Frontend:**
```env
NODE_ENV=production
PORT=3000
VITE_API_URL=http://backend:5000
```

Your application will be fully operational with internal container communication! 🚀