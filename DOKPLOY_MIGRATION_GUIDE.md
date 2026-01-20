# 🔄 Dokploy Migration Guide: 3-Service → 2-Service Architecture

## 📊 **Current vs New Architecture**

### **Before (3 Services):**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │───▶│  Backend    │───▶│ PostgreSQL  │
│   Service   │    │   Service   │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **After (2 Services):**
```
┌─────────────┐    ┌─────────────────────────────┐
│  Frontend   │───▶│  Integrated Backend        │
│   Service   │    │  (Node.js + PostgreSQL)    │
└─────────────┘    └─────────────────────────────┘
```

---

## 🚀 **Migration Steps**

### **Step 1: Backup Current Setup**
1. Export environment variables from current services
2. Note down current service names and configurations
3. Document current database connection details

### **Step 2: Delete Separate Database Service**
1. **Stop** the PostgreSQL service (`biskakenend-postgres-kbcgia`)
2. **Export/Backup** any important data if needed
3. **Delete** the service from Dokploy

### **Step 3: Update Backend Service**
1. **Change Dockerfile** from `server/Dockerfile` to `server/Dockerfile.dokploy-integrated`
2. **Update environment variables**:
   - Change `DB_HOST` from `biskakenend-postgres-kbcgia` to `localhost`
   - Keep all other variables the same
3. **Add volume** for PostgreSQL data persistence: `/var/lib/postgresql/data`

### **Step 4: Frontend Service (No Changes)**
- Keep existing frontend configuration
- No environment variable changes needed

### **Step 5: Deploy and Verify**
1. **Deploy** the updated backend service
2. **Verify** health endpoints work
3. **Test** database connection and functionality

---

## ✅ **Benefits of Integrated Architecture**

### **Simplified Management:**
- **2 services** instead of 3
- **Single container** for backend + database
- **Easier deployment** and monitoring

### **Resource Efficiency:**
- **Lower memory usage** (shared container resources)
- **Reduced network overhead** (localhost database connection)
- **Faster database queries** (no network latency)

### **Easier Scaling:**
- **Container-level scaling** includes both backend and database
- **Consistent data locality** when scaling up/down

---

## 🔧 **Environment Variable Changes**

### **Only Change Required:**
```diff
# Before
- DB_HOST=biskakenend-postgres-kbcgia
- DATABASE_URL=postgresql://postgres:3coinsltd@biskakenend-postgres-kbcgia:5432/biskaken_auto

# After  
+ DB_HOST=localhost
+ DATABASE_URL=postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto
```

### **All Other Variables Stay the Same:**
- `NODE_ENV=production`
- `PORT=5000`
- `DB_PASSWORD=3coinsltd`
- `JWT_SECRET=biskaken-super-secure-jwt-secret-2026-v5`
- `CORS_ORIGINS=https://biskakenauto.rpnmore.com,https://bisadmin.rpnmore.com`
- `GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q`

---

## 🚨 **Important Notes**

### **Data Persistence:**
- Database data will be stored in Docker volume
- **Configure volume** in Dokploy: `/var/lib/postgresql/data`
- Data survives container restarts and updates

### **Rollback Plan:**
- Keep documentation of old setup
- Can recreate separate database service if needed
- Database initialization script handles data recreation

### **Health Monitoring:**
- Health check monitors both Node.js and PostgreSQL
- Service fails if either component fails
- Supervisor manages both processes automatically

---

## 📋 **Migration Checklist**

- [ ] **Backup** current environment variables
- [ ] **Export** any critical database data  
- [ ] **Delete** separate PostgreSQL service
- [ ] **Update** backend service name to `biskaken-backend-integrated` (no numbers)
- [ ] **Update** backend Dockerfile to `Dockerfile.dokploy-integrated`
- [ ] **Change** `DB_HOST` to `localhost`
- [ ] **Configure** volume for data persistence
- [ ] **Deploy** integrated backend service
- [ ] **Verify** health endpoints respond
- [ ] **Test** login and database functionality
- [ ] **Monitor** logs for any issues

**Ready for simplified 2-service architecture! 🚀**