# 🚀 Deploy localhost:3000/dashboard to Dokploy

## 📦 Services to Create

### 1. PostgreSQL Database Service
```yaml
Service Type: PostgreSQL
Service Name: biskaken-postgres
Database: biskaken_auto
Username: postgres
Password: [your-secure-password]
Port: 5432
```

### 2. Backend API Service
```yaml
Service Name: biskaken-backend
Service Type: Application
Repository: https://github.com/plunoo/biskakenauto.git
Branch: main
Build Context: ./
Dockerfile: Dockerfile.backend
Container Port: 5000
Public Domain: [your-backend-domain.com]
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=5000
DB_HOST=biskaken-postgres
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=[your-secure-password]
```

### 3. Frontend Service
```yaml
Service Name: biskaken-frontend
Service Type: Application
Repository: https://github.com/plunoo/biskakenauto.git
Branch: main
Build Context: ./
Dockerfile: Dockerfile.frontend
Container Port: 80
Public Domain: [your-frontend-domain.com]
```

**Environment Variables:**
```env
NODE_ENV=production
VITE_API_URL=https://[your-backend-domain.com]
```

## 🔄 Deployment Steps

1. **Create PostgreSQL Service** first
2. **Deploy Backend Service** with database connection
3. **Deploy Frontend Service** pointing to backend
4. **Test** the complete application

## ✅ Expected Result

Your localhost:3000/dashboard will be running in production with:
- ✅ Full dashboard functionality
- ✅ Real PostgreSQL database
- ✅ All AI features working
- ✅ Authentication system
- ✅ Data persistence

## 🔗 Access URLs
- **Frontend**: https://[your-frontend-domain.com]/dashboard
- **Backend API**: https://[your-backend-domain.com]/health