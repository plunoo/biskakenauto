# 🚀 React Admin Dashboard + FastAPI API + PostgreSQL Deployment on Dokploy

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

## ⚙️ **STEP 2: Deploy FastAPI API Backend**

### **Service Configuration:**
```yaml
Service Name: biskaken-api-backend
Service Type: Application
Build Context: / (root directory)
Dockerfile: Dockerfile.fastapi
Container Port: 5000
Public Port: 5000
Public Domain: api.biskakenauto.rpnmore.com
Purpose: API Endpoints Only (No HTML/Dashboard)
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

## 🎨 **STEP 3: Deploy React Admin Dashboard**

### **Service Configuration:**
```yaml
Service Name: biskaken-admin-frontend
Service Type: Application
Build Context: / (root directory)
Dockerfile: Dockerfile.frontend
Container Port: 80
Public Port: 80
Public Domain: bisadmin.rpnmore.com
Purpose: Complete Admin Dashboard with Login (http://localhost:3000 equivalent)
```

### **Environment Variables:**
```env
NODE_ENV=production
VITE_API_URL=https://api.biskakenauto.rpnmore.com
VITE_APP_URL=https://bisadmin.rpnmore.com
VITE_BUILD_TARGET=admin
VITE_GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

---

## 🚀 **DEPLOYMENT ORDER**

### **Step 1: Deploy Database**
1. Create PostgreSQL service: `biskaken-postgres`
2. Wait for database to be ready
3. Verify database connection

### **Step 2: Deploy FastAPI API Backend** 
1. Create FastAPI service: `biskaken-api-backend`
2. Link to PostgreSQL database service  
3. Set environment variables
4. Deploy and verify API health
5. Test API endpoints (no HTML/dashboard served)

### **Step 3: Deploy React Admin Dashboard Frontend**
1. Create React service: `biskaken-admin-frontend`
2. Point VITE_API_URL to FastAPI backend
3. Deploy complete admin dashboard (equivalent to localhost:3000)
4. Test admin login at: https://bisadmin.rpnmore.com/login

---

## ✅ **VERIFICATION & TESTING**

### **API Health Checks:**
```bash
# API Status
curl https://api.biskakenauto.rpnmore.com/api/status

# Database Status  
curl https://api.biskakenauto.rpnmore.com/api/db-status

# Test Login API
curl -X POST https://api.biskakenauto.rpnmore.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@biskaken.com", "password": "admin123"}'
```

### **Admin Dashboard Access:**
- **Admin Login**: https://bisadmin.rpnmore.com/login  
- **Admin Dashboard**: https://bisadmin.rpnmore.com/dashboard
- **Complete Interface**: Equivalent to http://localhost:3000

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

| Service | Type | Domain | Port | Purpose |
|---------|------|--------|------|---------|
| biskaken-postgres | PostgreSQL | Internal | 5432 | Database |
| biskaken-api-backend | FastAPI | api.biskakenauto.rpnmore.com | 5000 | API Endpoints Only |
| biskaken-admin-frontend | React | bisadmin.rpnmore.com | 80 | Admin Dashboard (localhost:3000 equivalent) |

**Complete FastAPI + PostgreSQL + React deployment ready! 🎉**