# 🚀 Biskaken Auto Shop Management - Deployment Guide

This guide covers deploying the Biskaken Auto Shop Management system to **Dokploy** with the domain `biskakenauto.rpnmore.com`.

## 📋 Prerequisites

- Git repository: `https://github.com/plunoo/biskakenauto.git`
- Domain: `biskakenauto.rpnmore.com`
- PostgreSQL database
- Required API keys (see Environment Variables section)

## 🏗️ Architecture Overview

The application consists of:
- **Frontend**: React/TypeScript SPA built with Vite
- **Backend**: Node.js/Express API with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Build System**: Nixpacks (preferred) or Docker

## 🔧 Environment Variables

Create these environment variables in Dokploy:

### Required Variables
```bash
NODE_ENV=production
PORT=5000
APP_URL=https://biskakenauto.rpnmore.com
DATABASE_URL=postgresql://username:password@host:port/database?schema=public
JWT_SECRET=your-super-secure-jwt-secret-here
```

### AI Services
```bash
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### Payment Services (Ghana)
```bash
PAYSTACK_SECRET_KEY=sk_live_your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=pk_live_your-paystack-public-key
```

### SMS/Communication
```bash
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+233XXXXXXXXX
```

### Optional Services
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGINS=https://biskakenauto.rpnmore.com
```

## 🐳 Dokploy Deployment Steps

### 1. Create New Application in Dokploy

1. Login to your Dokploy dashboard
2. Create new application
3. Select "Git Repository" as source
4. Enter repository URL: `https://github.com/plunoo/biskakenauto.git`
5. Set branch: `main` (or your deployment branch)

### 2. Configure Build Settings

#### Option A: Nixpacks (Recommended)
- **Build Provider**: Nixpacks
- **Build File**: `nixpacks.toml` (already configured)
- **Start Command**: `cd biskaken-auto-api && npm start`

#### Option B: Docker
- **Build Provider**: Docker
- **Dockerfile**: `Dockerfile` (already configured)

### 3. Environment Configuration

Add all required environment variables in Dokploy's environment section:

```bash
# Copy from .env.example and update with production values
NODE_ENV=production
PORT=5000
APP_URL=https://biskakenauto.rpnmore.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=generate-strong-secret
GEMINI_API_KEY=your-actual-key
# ... add all other required variables
```

### 4. Domain Configuration

1. In Dokploy, go to your app's domain settings
2. Add domain: `biskakenauto.rpnmore.com`
3. Enable SSL (Let's Encrypt)
4. Configure DNS to point to Dokploy's IP

### 5. Database Setup

#### Option A: Dokploy PostgreSQL Service
1. Create PostgreSQL service in Dokploy
2. Configure database credentials
3. Update DATABASE_URL environment variable

#### Option B: External Database
1. Use external PostgreSQL provider (Supabase, AWS RDS, etc.)
2. Ensure database is accessible from Dokploy
3. Configure DATABASE_URL with external database

### 6. Deploy

1. Click "Deploy" in Dokploy
2. Monitor build logs
3. Verify deployment success
4. Test application functionality

## 🔄 Build Process

The build process follows these steps:

1. **Install Dependencies**: Frontend and backend dependencies
2. **Build Frontend**: Vite builds React app to `dist/`
3. **Build Backend**: TypeScript compiles to `dist/`
4. **Copy Static Files**: Frontend build copied to backend public folder
5. **Database Setup**: Prisma generates client and runs migrations
6. **Start Server**: Backend serves both API and static files

## 🧪 Testing Deployment

After deployment, test these endpoints:

### Health Checks
```bash
# API Health
curl https://biskakenauto.rpnmore.com/health

# Service Status
curl https://biskakenauto.rpnmore.com/api/status
```

### Frontend Routes
- Landing page: `https://biskakenauto.rpnmore.com/`
- Login: `https://biskakenauto.rpnmore.com/login`
- Dashboard: `https://biskakenauto.rpnmore.com/dashboard`

### API Endpoints
```bash
# Test endpoints (requires auth token)
curl https://biskakenauto.rpnmore.com/api/test/customers
curl https://biskakenauto.rpnmore.com/api/test/jobs
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
1. **Missing dependencies**: Ensure `package.json` includes all required packages
2. **TypeScript errors**: Fix any TypeScript compilation errors
3. **Environment variables**: Verify all required env vars are set

#### Runtime Issues
1. **Database connection**: Check DATABASE_URL format and network access
2. **Static files**: Verify frontend build is copied to backend public folder
3. **CORS errors**: Update CORS_ORIGINS with your domain

#### Performance Issues
1. **Memory limits**: Increase container memory in Dokploy
2. **Database connections**: Configure connection pooling
3. **Asset optimization**: Enable gzip compression

### Logs and Monitoring

Access logs in Dokploy:
1. Go to your application
2. Click "Logs" tab
3. Monitor for errors or warnings
4. Check both build and runtime logs

## 🔄 Updates and Maintenance

### Deploying Updates
1. Push changes to Git repository
2. Dokploy auto-deploys on push (if configured)
3. Or manually trigger deployment in Dokploy dashboard

### Database Migrations
```bash
# If database schema changes
cd biskaken-auto-api
npm run db:migrate
```

### Backup Strategy
1. **Database**: Regular PostgreSQL backups
2. **Files**: Backup uploaded files (if any)
3. **Environment**: Backup environment configuration

## 📊 Monitoring and Analytics

### Application Metrics
- Response times
- Error rates
- User activity
- API usage

### Business Metrics
- Jobs created/completed
- Revenue tracking
- Customer growth
- Inventory turnover

## 🛡️ Security Considerations

1. **SSL/TLS**: Enabled automatically with Let's Encrypt
2. **Environment Variables**: Secure storage in Dokploy
3. **Database Security**: Use connection pooling and SSL
4. **API Security**: JWT tokens with secure secrets
5. **CORS**: Restrict to your domain only
6. **Rate Limiting**: Configured in the backend

## 📞 Support

For deployment issues:
1. Check Dokploy documentation: https://github.com/Dokploy/docs
2. Review application logs in Dokploy dashboard
3. Verify all environment variables are set correctly
4. Test database connectivity

---

🇬🇭 **Built for Ghana's Auto Repair Industry** - Professional management for local workshops