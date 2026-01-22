# 🚀 FastAPI + PostgreSQL Deployment on Dokploy

## 📦 **REPOSITORY CONFIGURATION**
```
Repository: https://github.com/plunoo/biskakenauto.git
Branch: v5-complete-ai-system
Authentication: Use your GitHub token in Dokploy
```

---

## 🗄️ **STEP 1: Create PostgreSQL Database**

### **Database Configuration:**
```yaml
Service Name: biskaken-postgres
Service Type: PostgreSQL Database
PostgreSQL Version: 15
Database Name: biskaken_auto
Username: postgres
Password: 3coinsltd
Port: 5432
```

### **Database Environment:**
```env
POSTGRES_DB=biskaken_auto
POSTGRES_USER=postgres
POSTGRES_PASSWORD=3coinsltd
```

### **Volume Configuration:**
```yaml
Volume Mount: /var/lib/postgresql/data
Persistent Storage: Yes
```

---

## ⚙️ **STEP 2: Deploy FastAPI Backend**

### **Service Configuration:**
```yaml
Service Name: biskaken-fastapi-backend
Service Type: Application
Build Context: / (root directory)
Dockerfile: Dockerfile.fastapi
Container Port: 5000
Public Port: 5000
Public Domain: bisadmin.rpnmore.com
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

---

## 🎨 **STEP 3: Deploy React Frontend**

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

## 🚀 **DEPLOYMENT ORDER**

### **Step 1: Deploy Database**
1. Create PostgreSQL service: `biskaken-postgres`
2. Wait for database to be ready
3. Verify database connection

### **Step 2: Deploy Backend** 
1. Create FastAPI service: `biskaken-fastapi-backend`
2. Link to database service
3. Set environment variables
4. Deploy and verify health

### **Step 3: Deploy Frontend**
1. Create React service: `biskaken-frontend` 
2. Set API URL to backend
3. Deploy and test login

---

## ✅ **VERIFICATION & TESTING**

### **Backend Health Checks:**
```bash
# API Status
curl https://bisadmin.rpnmore.com/api/status

# Database Status
curl https://bisadmin.rpnmore.com/api/db-status

# Test Login
curl -X POST https://bisadmin.rpnmore.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@biskaken.com", "password": "admin123"}'
```

### **Frontend Access:**
- **Landing Page**: https://biskakenauto.rpnmore.com
- **Admin Login**: https://biskakenauto.rpnmore.com/login
- **Dashboard**: https://biskakenauto.rpnmore.com/dashboard

### **Login Credentials:**
- **Email**: admin@biskaken.com
- **Password**: admin123

---

## 🎯 **EXPECTED RESULTS**

### **API Response (bisadmin.rpnmore.com/api/status):**
```json
{
  "success": true,
  "message": "Biskaken Auto FastAPI v5.0 is running!",
  "service": "Biskaken Auto API",
  "version": "5.0.0",
  "framework": "FastAPI",
  "endpoints": {
    "health": "/health",
    "docs": "/api/docs",
    "login": "/api/auth/login",
    "customers": "/api/customers",
    "jobs": "/api/jobs",
    "db_status": "/api/db-status"
  }
}
```

### **Database Status Response:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "connected": true,
    "mode": "production",
    "host": "biskaken-postgres",
    "database": "biskaken_auto"
  }
}
```

---

## 📋 **SERVICE SUMMARY**

| Service | Type | Domain | Port | Status |
|---------|------|--------|------|--------|
| biskaken-postgres | PostgreSQL | Internal | 5432 | Database |
| biskaken-fastapi-backend | FastAPI | bisadmin.rpnmore.com | 5000 | Backend API |
| biskaken-frontend | React | biskakenauto.rpnmore.com | 80 | Frontend |

**Complete FastAPI + PostgreSQL + React deployment ready! 🎉**