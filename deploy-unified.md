# Unified Container Deployment Guide

## Quick Deploy to Dokploy

### 1. Use the Unified Container
In your Dokploy project settings:
- **Dockerfile**: `Dockerfile.unified-with-db`
- **Build Context**: Root directory

### 2. Set Environment Variables (Optional Overrides)
```bash
# Admin Access (Override defaults)
ADMIN_EMAIL=your-admin@domain.com
ADMIN_PASSWORD=YourSecurePassword123
ADMIN_NAME=Your Admin Name

# JWT Secret (IMPORTANT: Change this!)
JWT_SECRET=your-super-secret-jwt-key-here

# App URL
APP_URL=https://your-domain.com

# Optional Services
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-key
PAYSTACK_SECRET_KEY=your-paystack-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+233XXXXXXXXX
```

### 3. Deploy
- Click **Deploy** in Dokploy
- Wait for container to build and start (may take 2-3 minutes first time)
- PostgreSQL will initialize automatically inside the container

### 4. Access Your Application
- **URL**: https://your-domain.com
- **Admin Login**: Use your configured ADMIN_EMAIL and ADMIN_PASSWORD
- **Health Check**: https://your-domain.com/health
- **API Status**: https://your-domain.com/api/status

## What the Unified Container Includes

✅ **PostgreSQL Database** - Internal, automatically configured  
✅ **Backend API** - Full auto shop management system  
✅ **Frontend App** - React dashboard and admin interface  
✅ **Admin Authentication** - Environment-based admin access  
✅ **Database Migrations** - Automatic schema setup  
✅ **Health Monitoring** - Built-in health checks  

## Default Credentials (Change These!)

- **Email**: admin@biskaken.com
- **Password**: admin123

## Features Available

- 📊 Dashboard with database status indicator
- 👥 Customer management
- 🔧 Job/repair tracking  
- 📦 Inventory management
- 💰 Invoice and payment processing
- 📱 SMS notifications (with Twilio)
- 🤖 AI diagnostics (with OpenAI/Gemini)
- 💳 Mobile Money payments (Ghana)
- 📄 PDF generation and exports

## Troubleshooting

If deployment fails:
1. Check Dokploy logs for specific errors
2. Verify environment variables are set correctly  
3. Ensure domain is properly configured
4. Database initialization may take up to 2 minutes on first deploy

## Security Notes

🔒 **IMPORTANT**: Change default admin password and JWT secret in production!

The container runs with:
- Internal PostgreSQL (not exposed externally)
- Non-root user for security
- Proper file permissions
- Health checks for monitoring