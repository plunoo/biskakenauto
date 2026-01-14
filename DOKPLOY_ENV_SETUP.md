# 🚀 Dokploy Environment Variables Setup Guide

## 📦 Frontend Deployment (biskakenauto.rpnmore.com)

### Required Environment Variables:
```env
# Production Environment
NODE_ENV=production
PORT=80

# API Configuration
VITE_API_URL=https://bisadmin.rpnmore.com

# Build Configuration
VITE_APP_TITLE=Biskaken Auto V4
VITE_APP_VERSION=4.0.0
```

### Optional AI Configuration (for future):
```env
# AI Services (Add your API keys when ready)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

---

## 📡 Backend Deployment (bisadmin.rpnmore.com)

### Required Environment Variables:
```env
# Production Environment
NODE_ENV=production
PORT=5000

# JWT Security (REQUIRED - Change this!)
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_here_change_this

# CORS Configuration
CORS_ORIGINS=https://biskakenauto.rpnmore.com,http://localhost:3000,http://localhost:5173
```

### Optional Database Configuration:
```env
# PostgreSQL Database (Optional - works without DB in demo mode)
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### Optional Payment Integration:
```env
# Paystack (Ghana Mobile Money)
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
```

### Optional SMS/Communication:
```env
# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+233XXXXXXXXX
```

### Optional AI Services:
```env
# Google Gemini AI (for content generation)
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI (alternative AI provider)
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🔧 Dokploy Deployment Settings

### Frontend Service Settings:
```yaml
Service Name: biskaken-auto-frontend
Repository: https://github.com/plunoo/biskakenauto.git
Branch: v4-ai-features
Dockerfile: Dockerfile.frontend
Build Context: ./
Container Port: 80
Public Domain: biskakenauto.rpnmore.com
```

### Backend Service Settings:
```yaml
Service Name: biskaken-auto-backend
Repository: https://github.com/plunoo/bisadmin.git
Branch: main
Build Context: ./
Container Port: 5000
Public Domain: bisadmin.rpnmore.com
```

---

## 🔐 Security Requirements

### MUST CHANGE (Critical Security):
```env
# Change this JWT secret immediately!
JWT_SECRET=GenerateARandomString32CharactersLongForSecurity2024
```

### Test Credentials (Change after deployment):
```
Email: admin@biskaken.com
Password: admin123

⚠️ IMPORTANT: Change these credentials immediately after first login!
```

---

## ✅ Health Check Endpoints

After deployment, test these URLs:

### Frontend Health Checks:
```bash
# Main application
https://biskakenauto.rpnmore.com

# Login page
https://biskakenauto.rpnmore.com/login

# Admin login
https://biskakenauto.rpnmore.com/admin-login
```

### Backend Health Checks:
```bash
# Health check
curl https://bisadmin.rpnmore.com/health

# API status
curl https://bisadmin.rpnmore.com/api/status

# Test login
curl -X POST https://bisadmin.rpnmore.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biskaken.com","password":"admin123"}'
```

---

## 🎯 Deployment Steps

### Step 1: Deploy Backend First
1. Create new service in Dokploy for backend
2. Set repository: `https://github.com/plunoo/bisadmin.git`
3. Add all backend environment variables
4. Deploy and test health endpoints

### Step 2: Deploy Frontend
1. Create new service in Dokploy for frontend
2. Set repository: `https://github.com/plunoo/biskakenauto.git`
3. **IMPORTANT**: Set branch to `v3-ai-features`
4. Add frontend environment variables
5. Deploy and test application

### Step 3: Verify Integration
1. Test login at frontend URL
2. Verify AI features are visible
3. Test database status in settings
4. Confirm API connectivity

---

## 🚀 V3 AI Features Checklist

After deployment, verify these features work:

✅ **Dashboard AI Section**: Large colorful AI buttons visible  
✅ **Blog Management**: AI content generation (title, summary, article, image)  
✅ **Jobs AI Diagnostic**: Image upload + AI car problem analysis  
✅ **Settings System**: Real-time diagnostics and database status  
✅ **Security**: Session-based auth (asks for password each session)  
✅ **Version Display**: Shows "V3.0 AI Features Active! 🤖"  

---

## 🔧 Troubleshooting

### If V4 features don't show:
1. Verify Dokploy is deploying from `v4-ai-features` branch
2. Clear browser cache completely
3. Check console for JavaScript errors
4. Verify API connectivity

### If authentication issues:
1. Check JWT_SECRET is set correctly
2. Verify CORS_ORIGINS includes your domain
3. Test backend health endpoints
4. Clear browser storage completely

### If API errors:
1. Check backend logs in Dokploy
2. Verify environment variables are set
3. Test direct API endpoints with curl
4. Check CORS configuration

---

## 📞 Support

If you encounter issues:
1. Check Dokploy service logs
2. Test individual API endpoints
3. Verify all environment variables are set
4. Ensure both services can communicate

**Repository**: https://github.com/plunoo/biskakenauto.git  
**Branch**: v4-ai-features  
**Backend**: https://github.com/plunoo/bisadmin.git  
**Version**: 4.0.0 - Enhanced AI-Powered Features