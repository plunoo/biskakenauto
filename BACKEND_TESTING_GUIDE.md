# Backend API Testing Guide for Dokploy

## Backend Access URLs

Your backend should be accessible through Dokploy's external URL. Check your Dokploy dashboard for the backend service URL, it should look like:
- `https://[backend-service-name].your-domain.com`
- Or check if there's a direct backend URL in your Dokploy deployment

## 🧪 Test Endpoints Available

### 1. Health & Status Checks
```bash
# Basic health check
GET /health

# API status
GET /api/status

# Database connection status
GET /api/test/db-status

# List all available endpoints
GET /api/test/endpoints
```

### 2. Admin Dashboard Access
```bash
# Check admin login credentials
POST /api/test/admin-login
{
  "email": "admin@biskaken-v3.com",
  "password": "admin123"
}

# Get dashboard data
GET /api/test/reports/dashboard
```

### 3. Business Data Endpoints
```bash
# Customer data
GET /api/test/customers

# Job management
GET /api/test/jobs

# Inventory tracking
GET /api/test/inventory

# Invoice management
GET /api/test/invoices

# Blog management
GET /api/test/blog

# Financial reports
GET /api/test/reports/financial
```

### 4. Advanced Features
```bash
# Mobile money payment testing
POST /api/test/mobile-money
{
  "phone": "+233241234567",
  "amount": 150.00,
  "provider": "mtn"
}

# AI diagnosis testing
POST /api/test/ai-diagnosis
{
  "complaint": "Engine making strange noise",
  "vehicleInfo": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2018
  }
}

# Export reports
POST /api/test/reports/export
{
  "reportType": "financial",
  "format": "pdf",
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

## 🔧 Testing Steps

### Step 1: Find Your Backend URL
1. Login to your Dokploy dashboard
2. Navigate to your backend service
3. Look for the external URL or domain assigned to the backend
4. It should be different from the frontend URL (`biskakenauto.rpnmore.com`)

### Step 2: Test Basic Connectivity
```bash
# Replace [BACKEND_URL] with your actual backend URL
curl -X GET [BACKEND_URL]/health
```
Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-11T...",
  "service": "Biskaken Auto API",
  "version": "1.0.0"
}
```

### Step 3: Test Database Connection
```bash
curl -X GET [BACKEND_URL]/api/test/db-status
```
Expected response:
```json
{
  "success": true,
  "data": {
    "database_connected": true,
    "current_time": "...",
    "total_users": 1,
    "message": "Database connection successful"
  }
}
```

### Step 4: Test Admin Login
```bash
curl -X POST [BACKEND_URL]/api/test/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@biskaken-v3.com",
    "password": "admin123"
  }'
```

### Step 5: Test Dashboard Data
```bash
curl -X GET [BACKEND_URL]/api/test/reports/dashboard
```

## 🎯 Dashboard Access Through Browser

Once you have your backend URL, you can access the dashboard data directly:

1. **Health Check**: `[BACKEND_URL]/health`
2. **API Status**: `[BACKEND_URL]/api/status`
3. **Available Endpoints**: `[BACKEND_URL]/api/test/endpoints`
4. **Dashboard Data**: `[BACKEND_URL]/api/test/reports/dashboard`

## 🚨 Troubleshooting

### If endpoints return errors:
1. Check Dokploy logs for the backend service
2. Verify database service is running
3. Check environment variables are set correctly
4. Ensure CORS is configured properly

### Common Issues:
- **500 Error**: Database connection issue
- **404 Error**: Endpoint not found or service not running
- **CORS Error**: Frontend trying to access backend with wrong URL

## 📊 Expected Dashboard Data

The dashboard should return data like:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 15250.50,
      "totalJobs": 48,
      "pendingJobs": 7,
      "completedJobs": 41,
      "totalCustomers": 23,
      "lowStockItems": 3
    },
    "recentJobs": [...],
    "lowStock": [...]
  }
}
```

This confirms your backend is working correctly and ready for frontend integration.