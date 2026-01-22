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

## ⚙️ **STEP 2: Deploy FastAPI Backend with Admin Dashboard**

### **Service Configuration:**
```yaml
Service Name: biskaken-admin-backend
Service Type: Application
Build Context: / (root directory)
Dockerfile: Dockerfile.fastapi
Container Port: 5000
Public Port: 5000
Public Domain: bisadmin.rpnmore.com
Purpose: Admin Dashboard + Login + API Endpoints
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

## 🎨 **STEP 3: Deploy Blog/Landing Frontend**

### **Service Configuration:**
```yaml
Service Name: biskaken-blog-frontend
Service Type: Application
Build Context: / (root directory)
Dockerfile: Dockerfile.frontend
Container Port: 80
Public Port: 80
Public Domain: biskakenauto.rpnmore.com
Purpose: Blog and Landing Pages ONLY (NO LOGIN)
```

### **Environment Variables:**
```env
NODE_ENV=production
VITE_BUILD_TARGET=blog-only
VITE_APP_URL=https://biskakenauto.rpnmore.com
```

---

## 🚀 **DEPLOYMENT ORDER**

### **Step 1: Deploy Database**
1. Create PostgreSQL service: `biskaken-postgres`
2. Wait for database to be ready
3. Verify database connection

### **Step 2: Deploy FastAPI Admin Backend** 
1. Create FastAPI service: `biskaken-admin-backend`
2. Link to PostgreSQL database service  
3. Set environment variables
4. Deploy admin dashboard + API endpoints
5. Test admin login at: https://bisadmin.rpnmore.com/login

### **Step 3: Deploy Blog/Landing Frontend**
1. Create React service: `biskaken-blog-frontend`
2. Configure for blog and landing pages only (NO LOGIN)
3. Deploy public website 
4. Test public access at: https://biskakenauto.rpnmore.com

---

## ✅ **VERIFICATION & TESTING**

### **API Health Checks:**
```bash
# API Status
curl https://bisadmin.rpnmore.com/api/status

# Database Status  
curl https://bisadmin.rpnmore.com/api/db-status

# Test Login API
curl -X POST https://bisadmin.rpnmore.com/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@biskaken.com", "password": "admin123"}'
```

### **Access URLs:**
- **Public Website**: https://biskakenauto.rpnmore.com (blog/landing only)
- **Admin Login**: https://bisadmin.rpnmore.com/login  
- **Admin Dashboard**: https://bisadmin.rpnmore.com/dashboard

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
| biskaken-admin-backend | FastAPI | bisadmin.rpnmore.com | 5000 | Admin Dashboard + Login + API |
| biskaken-blog-frontend | React | biskakenauto.rpnmore.com | 80 | Blog + Landing Pages (NO LOGIN) |

**Complete FastAPI + PostgreSQL + React deployment ready! 🎉**