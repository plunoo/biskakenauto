# 🚀 V5 Dokploy Deployment - Integrated Backend + Database Architecture

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
Service Name: biskaken-frontend
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
VITE_API_URL=https://bisadmin.rpnmore.com
VITE_APP_URL=https://biskakenauto.rpnmore.com
VITE_BUILD_TARGET=production
VITE_GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

---

## ⚙️ **FASTAPI BACKEND + DATABASE SERVICE (FastAPI + PostgreSQL)**

### **Service Configuration:**
```yaml
Service Name: biskaken-fastapi-backend
Service Type: Application
Build Context: / (root directory)
Dockerfile: Dockerfile.fastapi
Container Port: 5000
Public Port: 5000
Public Domain: bisadmin.rpnmore.com
Entry Point: FastAPI with PostgreSQL integration
```

### **Environment Variables:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:3coinsltd@biskaken-postgres:5432/biskaken_auto
JWT_SECRET=biskaken-super-secure-jwt-secret-2026-v5
CORS_ORIGINS=https://biskakenauto.rpnmore.com,https://bisadmin.rpnmore.com
GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
DEMO_MODE=false
```

### **Volume Configuration:**
```yaml
Volumes:
  - /var/lib/postgresql/data (for database persistence)
```

---

## 🚀 **DEPLOYMENT STEPS - Integrated Architecture**

### **Step 1: Remove Separate Database Service**
- **Delete** the existing PostgreSQL service (`biskakenend-postgres-kbcgia`)
- Database will now run **inside** the backend container

### **Step 2: Update Repository Configuration**
- Repository: `https://github.com/plunoo/biskakenauto.git`
- Branch: `v5-complete-ai-system`

### **Step 3: Create/Update Integrated Backend Service**
1. **Service Name**: `biskaken-backend-integrated`
2. **Build Context**: `/server`
3. **Dockerfile**: `Dockerfile.dokploy-integrated`
4. **Container Port**: `5000`
5. **Add environment variables** from above (localhost DB_HOST)
6. **Configure volume** for PostgreSQL data persistence
7. **Deploy**

### **Step 4: Update Frontend Service**  
1. **Keep existing** frontend service configuration
2. **Ensure API URL** points to integrated backend
3. **Deploy**

### **Step 5: Verify Integrated Deployment**
- **Backend Health**: `https://bisadmin.rpnmore.com/health`
- **Frontend Access**: `https://biskakenauto.rpnmore.com`
- **Database Status**: `https://bisadmin.rpnmore.com/api/db-status`
- **Services**: Only 2 services running (Frontend + Integrated Backend)

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
    "host": "localhost",
    "database": "biskaken_auto",
    "architecture": "integrated"
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