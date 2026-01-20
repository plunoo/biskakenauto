# 🔧 V5 Environment Setup Guide - Integrated Backend + Database

## Required Environment Files for Simplified 2-Service Architecture

### 🎯 **Frontend Environment** (Dokploy Frontend Service)
**File**: `.env.production`
```env
# Frontend Configuration
NODE_ENV=production
PORT=3000
VITE_BUILD_TARGET=production

# Backend API URL (Internal Dokploy container communication)
VITE_API_URL=https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me

# Public app URL
VITE_APP_URL=https://biskakenauto.rpnmore.com

# AI Configuration (Gemini API)
VITE_GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

### 🗄️ **Backend + Database Environment** (Dokploy Integrated Service)
**File**: `.env.production`
```env
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Internal PostgreSQL Database Configuration (Integrated Container)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=3coinsltd

# Full database connection URL
DATABASE_URL=postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto

# Security Configuration
JWT_SECRET=biskaken-super-secure-jwt-secret-2026-v5
JWT_EXPIRES_IN=7d

# CORS Configuration (Frontend URLs)
CORS_ORIGINS=https://biskakenauto.rpnmore.com,https://bisadmin.rpnmore.com

# Database Mode (false = use integrated database, true = demo mode)
DEMO_MODE=false

# AI Configuration (Gemini API)
GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

## 📊 **Integrated PostgreSQL Database Setup**

The new architecture includes PostgreSQL **inside** the backend container:

- **Service Architecture**: Single container with Node.js + PostgreSQL
- **Database Host**: `localhost` (internal to container)
- **Database**: `biskaken_auto`
- **User**: `postgres`
- **Password**: `3coinsltd`
- **Internal Port**: `5432`
- **Connection URL**: `postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto`

## 🔄 **Database Auto-Initialization**

When V5 backend starts, it will automatically:

1. **Connect** to PostgreSQL using the credentials above
2. **Create tables** if they don't exist:
   - `users` - Admin user accounts
   - `customers` - Customer information
   - `jobs` - Repair jobs and work orders
   - `inventory` - Parts and supplies
   - `invoices` - Billing and payments
   - `blog_posts` - Blog content

3. **Insert default data**:
   - Default admin user: `admin@biskaken.com` / `admin123`
   - Demo customers and jobs (if needed)

4. **Fallback gracefully**:
   - If database connection fails, runs in demo mode
   - All API endpoints still work with demo data

## 🚀 **Deployment Steps - Integrated Architecture**

### Step 1: Update/Create Integrated Backend Service
In Dokploy, create or update backend service with:

**Dockerfile**: Use `Dockerfile.dokploy-integrated` (relative to `/server` build context)

**Environment Variables**:
```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=3coinsltd
DATABASE_URL=postgresql://postgres:3coinsltd@localhost:5432/biskaken_auto
JWT_SECRET=biskaken-super-secure-jwt-secret-2026-v5
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://biskakenauto.rpnmore.com,https://bisadmin.rpnmore.com
DEMO_MODE=false
GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

### Step 2: Update Frontend Environment  
In Dokploy frontend service, set:
```
NODE_ENV=production
PORT=3000
VITE_API_URL=https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me
VITE_APP_URL=https://biskakenauto.rpnmore.com
VITE_BUILD_TARGET=production
VITE_GEMINI_API_KEY=AIzaSyBnytBpJhjxrogjD2QGCOmd2wt_anQ758Q
```

### Step 3: Remove Separate Database Service
- **Delete** the separate PostgreSQL service (`biskakenend-postgres-kbcgia`)
- The database now runs **inside** the backend container

### Step 4: Deploy V5 Branch
Deploy from: `v5-complete-ai-system` branch

### Step 5: Verify Integrated Setup
Check endpoints:
- `GET /health` - Should show integrated database status
- `GET /api/db-status` - Should show "connected" status  
- `GET /api/status` - Should show database mode as "production"

## 🔍 **Testing Database Integration**

### Login Verification
Try logging in with:
- Demo: `admin@biskaken.com` / `admin123`
- Database users will be created automatically

### API Testing
```bash
# Check database status
curl https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me/api/db-status

# Test login
curl -X POST https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biskaken.com","password":"admin123"}'

# Test database data
curl https://biskakenend-biskakenback-yifz9h-abad91-168-231-117-165.traefik.me/api/customers
```

## ✅ **Expected Results**

After deployment:
- ✅ **Database Connection**: PostgreSQL connected and tables created
- ✅ **Authentication**: JWT-based login with database users
- ✅ **Data Persistence**: Real data stored in PostgreSQL
- ✅ **AI Features**: All V5 AI features working
- ✅ **Fallback**: Demo mode if database fails

## 🚨 **Troubleshooting**

### Database Connection Issues:
1. Check PostgreSQL service is running
2. Verify environment variables match image
3. Check container network communication
4. Review backend logs for connection errors

### Demo Mode Fallback:
- If database fails, system runs in demo mode
- All features still work with sample data
- Check `/api/status` for current mode

## 🤖 **AI Features & Gemini API Configuration**

### Current Status:
- ✅ **API Key**: Configured and working
- ⚠️ **Quota Status**: API key has exceeded free tier limits
- ✅ **Fallback System**: High-quality automotive content generation when API is unavailable

### AI Features Available:
1. **Blog Content Generation**: Titles, excerpts, and full articles
2. **Job Diagnosis**: AI-powered vehicle problem analysis
3. **Content Enhancement**: SEO-optimized content for Ghana's automotive market
4. **Fallback Content**: Professionally written automotive content when API is offline

### API Quota Solutions:
- **Free Tier**: Limited requests per day
- **Paid Plan**: Unlimited requests with billing enabled
- **Fallback Mode**: System continues working with pre-written automotive content

### Testing AI Features:
```bash
# Test the fallback system (always works)
curl localhost:3000/api/test/ai/generate-content

# All AI buttons in the interface will gracefully fall back to quality content
```

---

**Ready for Production**: V5 system with full database integration + AI features! 🚀