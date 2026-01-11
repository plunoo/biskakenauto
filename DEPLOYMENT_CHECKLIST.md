# ✅ Dokploy Deployment Checklist

## Pre-Deployment Setup

### 📋 Files Ready for Upload:
- [ ] `/server/` directory (backend application)
- [ ] Root directory (frontend application) 
- [ ] `docker-compose.dokploy.yml` (optional - full stack)
- [ ] Environment configuration files

### 🔐 Security Preparation:
- [ ] Generate secure JWT secret (32+ characters)
- [ ] Choose secure database password
- [ ] Plan to change default admin password

## 🚀 Deployment Steps

### Step 1: Database Service
- [ ] Create PostgreSQL service in Dokploy
- [ ] Service name: `postgres`
- [ ] Set environment variables:
  ```
  POSTGRES_DB=biskaken_auto
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=your_secure_password
  ```
- [ ] Configure persistent volume
- [ ] Deploy and verify healthy status

### Step 2: Backend Service  
- [ ] Create application service
- [ ] Upload `/server` directory
- [ ] Service name: `backend`
- [ ] Port: `5000`
- [ ] Set environment variables:
  ```
  NODE_ENV=production
  PORT=5000
  HOST=0.0.0.0
  DB_HOST=postgres
  DB_NAME=biskaken_auto
  DB_USER=postgres
  DB_PASSWORD=your_secure_password
  JWT_SECRET=your_super_secure_jwt_secret
  CORS_ORIGINS=https://biskakenauto.rpnmore.com,http://frontend:3000
  ```
- [ ] Deploy and test health endpoint: `/health`

### Step 3: Frontend Service
- [ ] Create application service
- [ ] Upload root directory (React app)
- [ ] Service name: `frontend`
- [ ] Port: `3000`
- [ ] Domain: `biskakenauto.rpnmore.com`
- [ ] Set environment variables:
  ```
  NODE_ENV=production
  PORT=3000
  VITE_API_URL=http://backend:5000
  VITE_APP_URL=https://biskakenauto.rpnmore.com
  ```
- [ ] Deploy and verify frontend loads

## 🧪 Post-Deployment Testing

### Frontend Tests:
- [ ] Landing page loads: `https://biskakenauto.rpnmore.com/landing`
- [ ] Login page accessible: `/login`
- [ ] Dashboard loads after login: `/dashboard`

### Backend API Tests:
- [ ] Health check works (internal): `http://backend:5000/health`
- [ ] Admin login works: `admin@biskaken-v3.com` / `admin123`
- [ ] API endpoints respond: `/api/customers`, `/api/jobs`, etc.

### Database Tests:
- [ ] Backend connects to database
- [ ] Tables created automatically
- [ ] Admin user exists in database
- [ ] Sample data can be created

## 🔧 Configuration Verification

### Internal Container Communication:
- [ ] Frontend can reach backend: `http://backend:5000`
- [ ] Backend can reach database: `postgres:5432`
- [ ] CORS allows frontend domain
- [ ] No external backend domain needed

### Environment Variables Check:
- [ ] Backend uses `postgres` as DB_HOST
- [ ] Frontend uses `http://backend:5000` as API URL
- [ ] All required secrets are set
- [ ] CORS includes both external domain and internal container

## 🔐 Security Hardening

### Immediate Actions:
- [ ] Change admin password: `admin@biskaken-v3.com`
- [ ] Verify JWT secret is secure (32+ chars)
- [ ] Check database password strength
- [ ] Review CORS settings

### Optional Enhancements:
- [ ] Set up database backups
- [ ] Configure monitoring/alerting
- [ ] Set up log aggregation
- [ ] Review rate limiting settings

## 🌐 Integration Tests

### Full Stack Flow:
- [ ] User can register/login
- [ ] Customer management works
- [ ] Job creation works
- [ ] Inventory management works
- [ ] Blog management works
- [ ] Reports generate properly
- [ ] Mobile responsive design works

## 🚨 Troubleshooting Quick Reference

**Frontend can't reach backend:**
- Check `VITE_API_URL=http://backend:5000`
- Verify backend service name is `backend`
- Check containers are in same project

**Backend can't reach database:**
- Check `DB_HOST=postgres`
- Verify database service name is `postgres`
- Check database is healthy

**CORS errors:**
- Verify `CORS_ORIGINS` includes your domain
- Check internal container communication allowed

## 🎉 Success Criteria

✅ **Deployment is successful when:**
- Frontend loads at https://biskakenauto.rpnmore.com
- Admin can login and access dashboard
- All main features work (customers, jobs, inventory)
- API calls work through internal container communication
- Database stores data persistently
- No CORS or connectivity errors

---

## 📞 Ready to Deploy!

Your Biskaken Auto application is configured for **Dokploy internal container deployment**. Follow this checklist step-by-step for a successful deployment! 🚀