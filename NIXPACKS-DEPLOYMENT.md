# Biskaken Auto - Nixpacks Deployment Guide

## 🚀 Production Deployment with Nixpacks (Recommended)

Nixpacks provides the simplest and most reliable deployment method for full-stack Node.js applications like Biskaken Auto.

## 🎯 Quick Start

### 1. Create Application in Dokploy

1. **Go to Dokploy Dashboard**
2. **Create New Application**
   - Type: **Application** (not Docker Compose)
   - Name: `biskaken-auto`

### 2. Configure Source

- **Source Type**: Git
- **Repository**: `https://github.com/plunoo/biskakenauto.git`
- **Branch**: `main`
- **Build Type**: **Nixpacks**

### 3. Configure Database

**Option A: Create Separate Database in Dokploy**
1. Create Database → PostgreSQL
2. Database Name: `biskaken_auto`
3. Username: `postgres`
4. Password: `your-secure-password`
5. Note the connection details

**Option B: Use Existing Database**
- Get your database connection string

### 4. Environment Variables

Set these in Dokploy Application → Environment:

```bash
# Application Configuration
NODE_ENV=production
PORT=3000
APP_URL=https://biskakenauto.rpnmore.com

# Database Configuration (replace with your actual values)
DATABASE_URL=postgresql://postgres:PASSWORD@DATABASE_HOST:5432/biskaken_auto
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USER=postgres

# Security
JWT_SECRET=your-super-secure-random-string-change-this-2024

# Admin Configuration
ADMIN_EMAIL=admin@biskaken.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User

# Optional Services (leave empty if not using)
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
PAYSTACK_SECRET_KEY=
```

### 5. Domain Configuration

- **Domain**: `biskakenauto.rpnmore.com`
- **Enable SSL**: Yes
- **Port**: 3000

### 6. Deploy

Click **Deploy** and monitor logs for:
```
📦 Installing dependencies...
🏗️  Building frontend...
🏗️  Building backend...
📁 Copying frontend to backend...
✅ Build completed successfully!
🚀 Starting Biskaken Auto Production...
```

## 📋 Complete Environment Variables Template

```bash
# === REQUIRED CONFIGURATION ===
NODE_ENV=production
PORT=3000
APP_URL=https://biskakenauto.rpnmore.com

# Database (REQUIRED - Replace with your values)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_DB_HOST:5432/biskaken_auto
DATABASE_HOST=YOUR_DB_HOST
DATABASE_PORT=5432
DATABASE_USER=postgres

# Security (REQUIRED - Change this!)
JWT_SECRET=super-secure-random-string-min-32-chars-2024

# Admin User (REQUIRED)
ADMIN_EMAIL=admin@biskaken.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User

# === OPTIONAL SERVICES ===
# OpenAI for AI Features
OPENAI_API_KEY=

# SMS Services (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Payment Processing (Paystack)
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# USDT Payments
USDT_WALLET_ADDRESS=
```

## 🔧 Build Process Details

The Nixpacks configuration automatically:

1. **Setup Phase**: Installs Node.js 20, PostgreSQL client, curl, bash
2. **Install Phase**: Installs frontend and backend dependencies
3. **Build Phase**: 
   - Builds frontend with Vite
   - Generates Prisma client
   - Compiles TypeScript backend
   - Copies frontend build to backend public folder
4. **Start Phase**:
   - Waits for database connection (30 retries)
   - Runs database migrations
   - Seeds initial data
   - Starts server on port 3000

## ⏱️ Expected Deployment Time

- **Build**: 3-5 minutes
- **First startup**: 2-3 minutes (includes DB setup)
- **Subsequent restarts**: 30-60 seconds
- **Total**: 5-8 minutes for first deployment

## ✅ Verification Steps

### 1. Check Application Health
```bash
curl https://biskakenauto.rpnmore.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Check Main Application
```bash
curl https://biskakenauto.rpnmore.com/
# Expected: HTML content with login page
```

### 3. Test Login
- URL: `https://biskakenauto.rpnmore.com`
- Username: `admin@biskaken.com`
- Password: `admin123`

## 🚨 Troubleshooting

### Build Failures

**Issue**: "npm ci failed"
- **Solution**: Check package.json files exist in root and biskaken-auto-api/
- **Check**: Ensure all dependencies are valid

**Issue**: "Vite build failed" 
- **Solution**: Check frontend code for TypeScript errors
- **Check**: Verify all imports are correct

**Issue**: "TypeScript compilation failed"
- **Solution**: Check backend code for type errors
- **Check**: Ensure all dependencies are installed

### Runtime Failures

**Issue**: "Database connection failed"
- **Solution**: Verify DATABASE_URL is correct
- **Check**: Ensure database service is running
- **Check**: Network connectivity between app and database

**Issue**: "Prisma migration failed"
- **Solution**: Check database permissions
- **Check**: Verify schema.prisma is valid
- **Solution**: Manual migration: `npx prisma migrate deploy`

**Issue**: "Server won't start"
- **Solution**: Check PORT environment variable
- **Check**: Ensure no port conflicts
- **Check**: Verify all required env vars are set

### Performance Issues

**Issue**: "Slow startup"
- **Normal**: First startup includes migration + seeding
- **Check**: Monitor logs for specific bottlenecks
- **Solution**: Subsequent restarts should be faster

## 🔒 Security Recommendations

1. **Change JWT_SECRET**: Use a strong, random 32+ character string
2. **Strong Admin Password**: Change from default `admin123`
3. **Database Password**: Use a strong database password
4. **Environment Variables**: Never commit secrets to git
5. **HTTPS Only**: Ensure SSL is enabled in Dokploy

## 📊 Monitoring

### Application Logs
- Monitor Dokploy application logs
- Look for database connection status
- Check for migration/seeding success

### Health Checks
- Dokploy automatically monitors `/health` endpoint
- Set up alerts for downtime
- Monitor response times

## 🔄 Updates & Maintenance

### Code Updates
1. Push changes to GitHub main branch
2. Redeploy in Dokploy (automatic with webhooks)
3. Monitor deployment logs

### Database Updates
- Migrations run automatically on deployment
- Backup database before major updates
- Test migrations in development first

This Nixpacks approach is **much simpler** than Docker Compose and handles the complexity automatically!