# Biskaken Auto - Dokploy Production Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Biskaken Auto management system to production using Dokploy on `biskakenauto.rpnmore.com`.

## Architecture
- **Frontend**: React/TypeScript with Vite build system
- **Backend**: Node.js/Express API with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker container with multi-stage build
- **Domain**: biskakenauto.rpnmore.com

## Prerequisites
1. Dokploy instance running and accessible
2. Domain `biskakenauto.rpnmore.com` configured in DNS
3. Repository access (GitHub/Git)
4. Required API keys (see environment variables section)

## Step-by-Step Deployment

### 1. Create New Application in Dokploy

1. Log into your Dokploy dashboard
2. Click "Create Application"
3. Choose "Docker" as deployment method
4. Configure:
   - **Name**: biskaken-auto
   - **Domain**: biskakenauto.rpnmore.com
   - **Repository**: [Your Git Repository URL]
   - **Branch**: main
   - **Build Path**: ./Dockerfile

### 2. Create PostgreSQL Database

1. In Dokploy, go to "Services" → "Databases"
2. Click "Create Database"
3. Select "PostgreSQL"
4. Configure:
   - **Name**: biskaken-auto-db
   - **Database Name**: biskaken_auto
   - **Username**: postgres
   - **Password**: [Generate secure password]
   - **Port**: 5432

**Important**: Note the connection details for environment variables.

### 3. Configure Environment Variables

In your Dokploy application settings, add these environment variables:

#### Required Variables
```bash
# Database
DATABASE_URL=postgresql://postgres:[DB_PASSWORD]@biskaken-auto-db:5432/biskaken_auto

# Application
NODE_ENV=production
PORT=5000
APP_URL=https://biskakenauto.rpnmore.com

# Security
JWT_SECRET=[Generate a secure 64-character random string]
JWT_EXPIRES_IN=7d

# Admin Account
ADMIN_EMAIL=admin@biskaken.com
ADMIN_PASSWORD=[Create secure admin password]
ADMIN_NAME=Admin User
```

#### Optional External API Keys
**⚠️ Set these manually in Dokploy for security:**

```bash
# AI Features (OpenAI)
OPENAI_API_KEY=sk-your-openai-key

# SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID=ACyour-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+233xxxxxxxxx

# Payment Processing (Paystack)
PAYSTACK_SECRET_KEY=sk_your_paystack_secret
PAYSTACK_PUBLIC_KEY=pk_your_paystack_public

# File Uploads (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Crypto Payments (Optional)
USDT_WALLET_ADDRESS=your-wallet-address
```

### 4. Deploy Application

1. **Trigger Deployment**:
   - In Dokploy, go to your application
   - Click "Deploy" or push to your main branch
   - Monitor build logs for any issues

2. **Wait for Build**:
   - Frontend build: ~3-5 minutes
   - Backend build: ~2-3 minutes
   - Database setup: ~1-2 minutes

3. **Verify Deployment**:
   - Visit `https://biskakenauto.rpnmore.com`
   - Check `/health` endpoint returns OK
   - Test admin login

### 5. Post-Deployment Configuration

#### 5.1 Database Verification
```bash
# Check if database is populated
curl https://biskakenauto.rpnmore.com/api/status
```

#### 5.2 Test Admin Login
1. Go to `https://biskakenauto.rpnmore.com/login`
2. Use credentials:
   - **Email**: admin@biskaken.com
   - **Password**: [Your ADMIN_PASSWORD]

#### 5.3 Verify Core Features
- ✅ Dashboard loads with data
- ✅ Customer management works
- ✅ Inventory tracking functional
- ✅ Job management operational
- ✅ Invoice generation working

## Docker Configuration Explained

### Multi-Stage Build Process
1. **Frontend Build**: Compiles React app with production API URL
2. **Backend Build**: Compiles TypeScript, generates Prisma client
3. **Production Runtime**: Combines built assets, includes startup script

### Key Features
- **Database Initialization**: Automatic migration and seeding
- **Health Checks**: Built-in monitoring endpoints
- **Static File Serving**: Frontend served by Express backend
- **Graceful Startup**: Waits for database before starting

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
**Problem**: App can't connect to database
**Solution**:
- Verify DATABASE_URL format
- Ensure database service is running
- Check database credentials

#### 2. Build Failures
**Problem**: Docker build fails
**Solution**:
- Check build logs in Dokploy
- Verify all source files are committed
- Ensure package.json dependencies are correct

#### 3. Frontend Not Loading
**Problem**: Website shows "Cannot GET /"
**Solution**:
- Verify frontend build succeeded
- Check Express static file serving configuration
- Ensure VITE_API_URL is set correctly

#### 4. API Endpoints Not Working
**Problem**: API calls return 404/500 errors
**Solution**:
- Check backend startup logs
- Verify database migrations ran successfully
- Test individual endpoints via curl

### Health Check Endpoints

```bash
# Basic health check
curl https://biskakenauto.rpnmore.com/health

# Detailed system status
curl https://biskakenauto.rpnmore.com/api/status

# Database connectivity
curl https://biskakenauto.rpnmore.com/api/database/status
```

### Log Monitoring

In Dokploy:
1. Go to your application
2. Click "Logs" tab
3. Monitor for errors during startup
4. Look for database connection confirmations

## Security Considerations

### Environment Variables
- ✅ Never commit API keys to repository
- ✅ Use Dokploy's environment variable encryption
- ✅ Rotate secrets regularly
- ✅ Use strong JWT secrets (64+ characters)

### Database Security
- ✅ Use strong database passwords
- ✅ Enable SSL connections in production
- ✅ Restrict database access to application only
- ✅ Regular database backups

### Application Security
- ✅ HTTPS enforced via Dokploy
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ JWT token expiration configured

## Maintenance

### Regular Tasks
1. **Monitor Resource Usage**: Check CPU/memory in Dokploy
2. **Database Backups**: Schedule regular backups
3. **Security Updates**: Keep dependencies updated
4. **Log Review**: Monitor application logs weekly

### Scaling Considerations
- **Database**: Consider read replicas for high traffic
- **Application**: Horizontal scaling available in Dokploy
- **Storage**: Monitor disk usage for logs/uploads
- **CDN**: Consider CloudFlare for static assets

## Support

For deployment issues:
1. Check Dokploy documentation: https://docs.dokploy.com
2. Review application logs in Dokploy dashboard
3. Test locally with same environment variables
4. Contact development team with specific error messages

---

**🎉 Congratulations!** Your Biskaken Auto system should now be running in production at `https://biskakenauto.rpnmore.com`