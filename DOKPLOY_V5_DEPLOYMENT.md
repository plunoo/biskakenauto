# 🚀 V5 Dokploy Deployment - Complete AI System with PostgreSQL

## 📦 **REPOSITORY CONFIGURATION**
```
Repository: https://github.com/plunoo/biskakenauto.git
Branch: v5-complete-ai-system
Authentication: Use your GitHub token in Dokploy
```

---

## 🎨 **FRONTEND SERVICE (React App)**

### **Service Configuration:**
```yaml
Service Name: biskaken-frontend-v5
Service Type: Application
Build Context: / (root directory)
Dockerfile: Dockerfile.frontend
Container Port: 80
Public Port: 80
Public Domain: biskakenauto.rpnmore.com
```

### **Environment Variables:**
```env
NODE_ENV=production
VITE_API_URL=https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me
VITE_APP_URL=https://biskakenauto.rpnmore.com
VITE_BUILD_TARGET=production
VITE_GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

---

## ⚙️ **BACKEND SERVICE (Node.js API)**

### **Service Configuration:**
```yaml
Service Name: biskaken-backend-v5
Service Type: Application
Build Context: /server
Dockerfile: server/Dockerfile
Container Port: 5000
Public Port: 5000
Public Domain: bisadmin.rpnmore.com
Entry Point: app.js
```

### **Environment Variables:**
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=biskakenend-postgres-kbcgia
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=3coinsltd
DATABASE_URL=postgresql://postgres:3coinsltd@biskakenend-postgres-kbcgia:5432/biskaken_auto
JWT_SECRET=biskaken-super-secure-jwt-secret-2026-v5
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://biskakenauto.rpnmore.com,https://bisadmin.rpnmore.com
DEMO_MODE=false
GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

---

## 🗄️ **POSTGRESQL DATABASE (Already Running)**
```yaml
Service Name: biskakenend-postgres-kbcgia
Database: biskaken_auto
User: postgres
Password: 3coinsltd
Internal Port: 5432
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Update Repository**
- Change from `bisadmin.git` to `biskakenauto.git`
- Set branch to `v5-complete-ai-system`

### **Step 2: Backend Service**
1. **Create/Update** backend service
2. **Set build context** to `/server`
3. **Add environment variables** from above
4. **Deploy**

### **Step 3: Frontend Service**  
1. **Create/Update** frontend service
2. **Set build context** to `/` (root)
3. **Add environment variables** from above
4. **Deploy**

### **Step 4: Verify Deployment**
- **Backend Health**: `https://bisadmin.rpnmore.com/health`
- **Frontend Access**: `https://biskakenauto.rpnmore.com`
- **Database Status**: `https://bisadmin.rpnmore.com/api/db-status`

---

## ✅ **EXPECTED RESULTS**

### **Backend API v5.0:**
```json
{
  "message": "Biskaken Auto API v5 is running!",
  "version": "5.0.0",
  "database": "production",
  "endpoints": {
    "health": "/health",
    "status": "/api/status", 
    "db-status": "/api/db-status"
  }
}
```

### **Database Status:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "connected": true,
    "mode": "production",
    "host": "biskakenend-postgres-kbcgia",
    "database": "biskaken_auto"
  }
}
```

### **Frontend Features:**
- ✅ All V5 AI diagnostic features
- ✅ Real-time database status detection  
- ✅ AI content generation with Gemini
- ✅ PostgreSQL data persistence
- ✅ JWT authentication with database users

### **Login Credentials:**
- **Email**: `admin@biskaken.com`
- **Password**: `admin123`

---

## 🎯 **ACCESS URLS**
- **Frontend**: https://biskakenauto.rpnmore.com
- **Backend API**: https://bisadmin.rpnmore.com  
- **Admin Dashboard**: https://biskakenauto.rpnmore.com/dashboard
- **Database Status**: https://bisadmin.rpnmore.com/api/db-status

**Complete V5 AI system with real PostgreSQL database integration! 🚀**