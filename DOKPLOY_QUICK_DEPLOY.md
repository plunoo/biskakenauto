# ⚡ Quick Dokploy Deployment - Biskaken Auto Admin

## 🚀 One-Click Deployment Instructions

### 1. Environment Variables (Copy to Dokploy)

```env
DB_HOST=biskaken-postgres
DB_PORT=5432  
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!
VITE_API_URL=https://bisadmin.rpnmore.com
VITE_APP_TITLE=Biskaken Auto Admin
VITE_ENVIRONMENT=production
NODE_ENV=production
ENVIRONMENT=production
PORT=8000
CORS_ORIGINS=https://bisadmin.rpnmore.com,https://biskakenauto.rpnmore.com
DATABASE_URL=postgresql://postgres:YourSecurePassword123!@biskaken-postgres:5432/biskaken_auto
```

### 2. Deployment Steps

1. **Create Project**: Name it `biskaken-admin`
2. **Upload**: Use `dokploy-admin.yml` as compose file
3. **Set Variables**: Paste environment variables above (change password!)
4. **Deploy**: Start services in order: Database → API → Frontend

### 3. Verification URLs

- **Admin Dashboard**: https://bisadmin.rpnmore.com
- **API Health**: https://bisadmin.rpnmore.com/health
- **DB Status**: https://bisadmin.rpnmore.com/api/db-status

### 4. Default Login

- **Email**: admin@biskaken.com
- **Password**: admin123 (⚠️ CHANGE IMMEDIATELY!)

### 5. Services Architecture

```
bisadmin.rpnmore.com
├── Frontend (React) → Port 3000
├── API (FastAPI) → Port 8000 → /api/*
└── Database (PostgreSQL) → Internal only
```

### 6. Quick Commands

```bash
# Test deployment
curl https://bisadmin.rpnmore.com/health

# Run automated deployment  
export DB_PASSWORD='YourSecurePassword123!'
./deploy.sh

# Local testing only
./deploy.sh --local-test
```

### 7. File Structure

```
biskaken-auto/
├── api/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # API container config
│   └── init.sql            # Database schema
├── dokploy-admin.yml       # Main deployment config
├── nginx.conf              # Frontend web server
├── deploy.sh               # Automated deployment
└── DEPLOYMENT_GUIDE.md     # Full documentation
```

That's it! Your admin dashboard will be live at `bisadmin.rpnmore.com` with full PostgreSQL backend integration.