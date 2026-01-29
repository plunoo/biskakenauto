# 🎯 Step-by-Step Dokploy Deployment Instructions

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Dokploy server running and accessible
- [ ] Domain `bisadmin.rpnmore.com` pointing to your Dokploy server IP
- [ ] All deployment files ready (see file list below)
- [ ] Secure database password prepared

## 📁 Required Files

Ensure these files exist in your project:
```
biskaken-auto/
├── dokploy-admin.yml       ← Main deployment file
├── api/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── init.sql
├── nginx.conf
├── docker-entrypoint.sh
└── env.production.example
```

## 🚀 Detailed Deployment Steps

### Step 1: Access Dokploy Dashboard

1. **Open your browser** and navigate to your Dokploy dashboard
   ```
   https://your-dokploy-server.com
   ```

2. **Login** with your Dokploy admin credentials

3. **Verify Traefik is running** (should show green status in dashboard)

### Step 2: Create New Project

1. **Click "Projects"** in the main navigation

2. **Click "Create Project"** button

3. **Fill in project details:**
   ```
   Project Name: biskaken-admin
   Description: Biskaken Auto Admin Dashboard
   ```

4. **Click "Create"** to create the project

### Step 3: Set Up Environment Variables

1. **Go to your project** (`biskaken-admin`)

2. **Click "Environment Variables"** tab

3. **Add each variable** by clicking "Add Environment Variable":

   ```env
   # Database Configuration
   DB_HOST = biskaken-postgres
   DB_PORT = 5432
   DB_NAME = biskaken_auto
   DB_USER = postgres
   DB_PASSWORD = YourVerySecurePassword123!
   
   # API Configuration  
   VITE_API_URL = https://bisadmin.rpnmore.com
   VITE_APP_TITLE = Biskaken Auto Admin
   VITE_ENVIRONMENT = production
   
   # Security
   NODE_ENV = production
   ENVIRONMENT = production
   PORT = 8000
   
   # CORS Origins
   CORS_ORIGINS = https://bisadmin.rpnmore.com,https://biskakenauto.rpnmore.com
   
   # Database URL (auto-generated)
   DATABASE_URL = postgresql://postgres:YourVerySecurePassword123!@biskaken-postgres:5432/biskaken_auto
   ```

4. **Important**: Replace `YourVerySecurePassword123!` with your actual secure password

5. **Save** the environment variables

### Step 4: Upload Docker Compose File

#### Method A: Using Git Repository (Recommended)

1. **Click "Services"** in your project

2. **Click "Create Service"**

3. **Select "Git Repository"**

4. **Fill in repository details:**
   ```
   Repository URL: https://github.com/your-username/biskaken-auto
   Branch: main
   Build Path: /
   Dockerfile: Leave blank (will use docker-compose)
   ```

5. **In "Build Settings":**
   - **Docker Compose File**: `dokploy-admin.yml`
   - **Build Context**: `./`

6. **Click "Create Service"**

#### Method B: Upload Files Directly

1. **Click "Services"** in your project

2. **Click "Create Service"**

3. **Select "Upload Files"**

4. **Prepare your files:**
   - Zip all files: `zip -r biskaken-admin.zip .` (exclude node_modules, .git)
   - Or use Dokploy file browser to upload individual files

5. **Upload the zip file** or drag & drop files

6. **Set Docker Compose file** to `dokploy-admin.yml`

### Step 5: Configure Service Settings

1. **In Service Settings:**
   ```
   Service Name: biskaken-admin-stack
   Port: 3000 (for frontend)
   Domain: bisadmin.rpnmore.com
   ```

2. **Enable SSL Certificate:**
   - Check "Enable SSL"
   - Select "Let's Encrypt"
   - Domain: `bisadmin.rpnmore.com`

3. **Health Check Settings:**
   ```
   Health Check Path: /health
   Health Check Port: 3000
   ```

### Step 6: Deploy the Stack

1. **Review configuration** - double-check all settings

2. **Click "Deploy"** button

3. **Monitor deployment logs:**
   - Click "Logs" tab to watch real-time deployment
   - Look for these success messages:
     ```
     ✅ Database container started
     ✅ API container started  
     ✅ Frontend container started
     ✅ SSL certificate obtained
     ```

### Step 7: Verify Deployment

#### Check Service Status
1. **In Dokploy dashboard**, verify all services show "Running" status:
   - `biskaken-postgres` - Database
   - `biskaken-api` - FastAPI backend
   - `biskaken-frontend` - React frontend

#### Test Endpoints
2. **Open new browser tabs** and test:
   ```
   Frontend:        https://bisadmin.rpnmore.com
   API Health:      https://bisadmin.rpnmore.com/health
   Database Status: https://bisadmin.rpnmore.com/api/db-status
   API Status:      https://bisadmin.rpnmore.com/api/status
   ```

#### Check SSL Certificate
3. **Verify HTTPS** - browser should show secure lock icon

### Step 8: First Login & Setup

1. **Navigate to**: `https://bisadmin.rpnmore.com`

2. **Login with default credentials:**
   ```
   Email: admin@biskaken.com
   Password: admin123
   ```

3. **⚠️ IMMEDIATELY change password:**
   - Go to Settings → User Management
   - Change admin password to something secure
   - Update admin email if needed

4. **Test functionality:**
   - Try creating a customer
   - Test AI diagnostic features
   - Verify database connectivity

## 🔧 Troubleshooting Common Issues

### Issue 1: Services Won't Start

**Check logs in Dokploy:**
```bash
# Database logs
docker logs biskaken-postgres

# API logs  
docker logs biskaken-api

# Frontend logs
docker logs biskaken-frontend
```

**Common fixes:**
- Verify environment variables are set correctly
- Check database password doesn't have special characters that need escaping
- Ensure Docker Compose file syntax is valid

### Issue 2: Domain Not Accessible

**Check DNS resolution:**
```bash
nslookup bisadmin.rpnmore.com
```

**Verify Traefik routing:**
- Check Traefik dashboard for routing rules
- Ensure domain labels are correct in docker-compose

### Issue 3: SSL Certificate Failed

**Check Traefik logs:**
```bash
docker logs traefik
```

**Common fixes:**
- Verify domain is pointing to correct IP
- Check port 80/443 are open
- Ensure no other services using same domain

### Issue 4: Database Connection Failed

**Test database connectivity:**
```bash
# From API container
docker exec -it biskaken-api python -c "
import asyncpg
import asyncio
async def test():
    conn = await asyncpg.connect('postgresql://postgres:PASSWORD@biskaken-postgres:5432/biskaken_auto')
    print(await conn.fetchval('SELECT version()'))
asyncio.run(test())
"
```

**Common fixes:**
- Verify DATABASE_URL environment variable
- Check database container is running
- Ensure database password is correct

## ✅ Success Checklist

After deployment, verify:
- [ ] All 3 containers running (database, api, frontend)
- [ ] HTTPS certificate working (green lock in browser)
- [ ] Admin login page loads
- [ ] Can login with default credentials
- [ ] Default password changed
- [ ] API endpoints responding
- [ ] Database queries working
- [ ] AI features functional

## 🎯 Next Steps After Successful Deployment

1. **Security Hardening:**
   - Change all default passwords
   - Review user permissions
   - Set up regular database backups

2. **Customization:**
   - Add your business logo/branding
   - Configure company settings
   - Import customer data

3. **Monitoring:**
   - Set up log monitoring
   - Configure performance alerts
   - Plan backup strategy

4. **Training:**
   - Train staff on admin features
   - Document business processes
   - Set up user accounts

---

**🎉 Congratulations!** Your Biskaken Auto Admin Dashboard should now be running at `https://bisadmin.rpnmore.com`