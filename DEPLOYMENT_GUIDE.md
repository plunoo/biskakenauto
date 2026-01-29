# 🚀 Biskaken Auto Admin Dashboard - Dokploy Deployment Guide

## 📋 Overview

This guide will help you deploy the Biskaken Auto Admin Dashboard on Dokploy with:
- **Frontend**: React admin dashboard at `bisadmin.rpnmore.com`
- **Backend**: FastAPI with PostgreSQL
- **Database**: PostgreSQL with auto-seeding
- **SSL**: Automatic Let's Encrypt certificates

## 🏗️ Architecture

```
bisadmin.rpnmore.com
├── Frontend (React + Nginx) - Port 3000
├── Backend (FastAPI) - Port 8000  
└── Database (PostgreSQL) - Port 5432
```

## 📝 Pre-Deployment Checklist

### 1. Domain Setup
- [ ] Ensure `bisadmin.rpnmore.com` DNS points to your Dokploy server
- [ ] Verify `biskakenauto.rpnmore.com` is already running (for CORS)

### 2. Dokploy Prerequisites
- [ ] Dokploy server running with Docker
- [ ] Traefik reverse proxy configured
- [ ] Let's Encrypt certificate resolver setup

## 🚀 Deployment Steps

### Step 1: Clone and Prepare Repository

```bash
# Clone your repository
git clone <your-repo-url>
cd biskaken-auto

# Ensure all files are present
ls -la api/
ls -la dokploy-admin.yml
```

### Step 2: Set Environment Variables in Dokploy

In your Dokploy dashboard, add these environment variables:

```env
# Database Configuration
DB_HOST=biskaken-postgres
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=your_very_secure_password_here_123!

# API Configuration
VITE_API_URL=https://bisadmin.rpnmore.com
VITE_APP_TITLE=Biskaken Auto Admin
VITE_ENVIRONMENT=production

# Security
NODE_ENV=production
ENVIRONMENT=production

# CORS Origins
CORS_ORIGINS=https://bisadmin.rpnmore.com,https://biskakenauto.rpnmore.com

# FastAPI Configuration
PORT=8000

# Auto-generated Database URL
DATABASE_URL=postgresql://postgres:your_very_secure_password_here_123!@biskaken-postgres:5432/biskaken_auto
```

### Step 3: Deploy with Docker Compose

#### Option A: Using Dokploy UI
1. Create new project: "biskaken-admin"
2. Upload `dokploy-admin.yml` as compose file
3. Set environment variables from above
4. Deploy services in order:
   - Database first
   - API second  
   - Frontend last

#### Option B: Using Dokploy CLI
```bash
dokploy compose up -f dokploy-admin.yml -p biskaken-admin
```

### Step 4: Verify Deployment

Check each service:

```bash
# Check database health
curl https://bisadmin.rpnmore.com/health

# Check API status  
curl https://bisadmin.rpnmore.com/api/status

# Check frontend
curl https://bisadmin.rpnmore.com/

# Check database connection
curl https://bisadmin.rpnmore.com/api/db-status
```

## 🔧 Configuration Details

### Database Features
- **Auto-seeding**: Demo data created on first startup
- **Comprehensive schema**: Users, customers, jobs, inventory, invoices, blog
- **Performance optimized**: Indexes and constraints
- **Audit trail**: Full activity logging

### Security Features
- **HTTPS only**: Automatic SSL certificates
- **CORS protection**: Restricted to your domains
- **Security headers**: XSS, CSRF protection via Nginx
- **Content Security Policy**: Prevents script injection

### Monitoring & Health Checks
- **Database health**: `/health` endpoint
- **API status**: `/api/status` endpoint  
- **Frontend health**: `/health` endpoint
- **Docker health checks**: Built into containers

## 🔑 Default Login Credentials

**⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN**

- **Email**: `admin@biskaken.com`
- **Password**: `admin123`

## 📊 Admin Dashboard Features

### Core Modules
- **Dashboard**: Overview with AI insights
- **Jobs Management**: Service orders with AI diagnosis
- **Customer Management**: Vehicle and contact info
- **Inventory**: Parts tracking with low-stock alerts
- **Invoicing**: Billing and payment tracking
- **Blog Management**: Content creation with AI assistance
- **Reports**: Business analytics
- **User Management**: Staff and permissions

### AI Features
- **Auto Diagnosis**: Upload photos, get repair suggestions
- **Content Generation**: AI-powered blog writing
- **Business Insights**: Automated reporting
- **Cost Estimation**: Smart pricing suggestions

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Fails
```bash
# Check if PostgreSQL is running
docker logs biskaken-postgres

# Verify environment variables
echo $DATABASE_URL

# Test direct connection
docker exec -it biskaken-postgres psql -U postgres -d biskaken_auto -c "SELECT version();"
```

#### API Not Responding
```bash
# Check API logs
docker logs biskaken-api

# Verify API health
curl https://bisadmin.rpnmore.com/health

# Check if database is reachable from API
docker exec -it biskaken-api python -c "import asyncpg; print('Testing...')"
```

#### Frontend Not Loading
```bash
# Check frontend logs
docker logs biskaken-frontend

# Verify build completed
docker exec -it biskaken-frontend ls -la /usr/share/nginx/html/

# Check Nginx config
docker exec -it biskaken-frontend nginx -t
```

#### SSL Certificate Issues
```bash
# Check Traefik logs
docker logs traefik

# Verify domain resolution
nslookup bisadmin.rpnmore.com

# Test HTTP to HTTPS redirect
curl -I http://bisadmin.rpnmore.com/
```

### Performance Optimization

#### Database Optimization
```sql
-- Run these queries to optimize performance
ANALYZE;
REINDEX DATABASE biskaken_auto;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Frontend Optimization
- Assets are automatically compressed with Gzip
- Static files cached for 1 year
- React build optimized for production

## 🔄 Updates & Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
dokploy compose up --build -f dokploy-admin.yml

# Run database migrations if needed
docker exec -it biskaken-api python -c "
import asyncpg
# Add migration scripts here
"
```

### Database Backups
```bash
# Create backup
docker exec biskaken-postgres pg_dump -U postgres biskaken_auto > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup  
docker exec -i biskaken-postgres psql -U postgres -d biskaken_auto < backup_file.sql
```

### Log Management
```bash
# View application logs
docker logs biskaken-frontend -f
docker logs biskaken-api -f
docker logs biskaken-postgres -f

# Clear old logs (be careful!)
docker system prune --volumes -f
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Add multiple API replicas behind load balancer
- Use external PostgreSQL cluster for high availability
- Implement Redis for session/cache management

### Monitoring Setup
- Add Prometheus metrics endpoints
- Configure Grafana dashboards  
- Set up alerts for critical failures

## 🎯 Production Checklist

### Security
- [ ] Changed default admin password
- [ ] Configured strong database password
- [ ] Enabled firewall rules
- [ ] Set up SSL certificates
- [ ] Configured backup strategy

### Performance  
- [ ] Database indexes optimized
- [ ] Frontend assets compressed
- [ ] CDN configured (optional)
- [ ] Health checks responding

### Monitoring
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Backup verification tested
- [ ] Alert notifications set up

## 💡 Tips for Success

1. **Test locally first**: Use `docker-compose up` to test the entire stack
2. **Monitor during deployment**: Watch logs for any errors
3. **Backup before updates**: Always backup database before changes
4. **Use staging environment**: Test changes on staging before production
5. **Document customizations**: Keep track of any custom configurations

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Docker logs for error messages
3. Verify all environment variables are set correctly
4. Test database connectivity independently
5. Ensure domain DNS is pointing to the correct server

---

**🚀 Your Biskaken Auto Admin Dashboard should now be running at `https://bisadmin.rpnmore.com`**

Remember to change the default login credentials immediately after your first login!