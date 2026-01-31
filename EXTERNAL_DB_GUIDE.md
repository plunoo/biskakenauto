# 🗄️ Database Configuration Guide

Biskaken Admin Dashboard supports internal PostgreSQL and external database connections.

## 🚀 Current Setup

### 1. **Internal PostgreSQL** (Default - Active)
Uses Dokploy's internal PostgreSQL database with docker-compose.

### 2. **External Database Mode** (Available - Currently Disabled)
Can switch to external services by uncommenting environment variables.

### 3. **Demo Mode** (Fallback)
Uses built-in demo data if no database connections work.

## 📋 Supported Services

### **Supabase** (Recommended)
PostgreSQL as a Service with REST API
```bash
VITE_API_URL=https://your-project.supabase.co/rest/v1
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### **Firebase** 
Google's real-time database
```bash
VITE_EXTERNAL_DB_URL=https://your-project-default-rtdb.firebaseio.com
```

### **Airtable**
Spreadsheet as database
```bash
VITE_API_URL=https://api.airtable.com/v0/your_base_id
VITE_AIRTABLE_KEY=your_airtable_api_key
```

### **MongoDB Atlas**
Cloud MongoDB with Data API
```bash
VITE_API_URL=https://data.mongodb-api.com/app/your-app-id/endpoint/data/v1
```

### **Strapi**
Headless CMS
```bash
VITE_API_URL=https://your-strapi-app.herokuapp.com/api
```

### **Custom REST API**
Your own backend
```bash
VITE_API_URL=https://api.yourdomain.com
```

### **GraphQL**
Any GraphQL endpoint
```bash
VITE_API_URL=https://your-graphql-endpoint.com/graphql
```

## 🔧 Dokploy Setup

### Current: Internal PostgreSQL
1. **Create Compose Service** in Dokploy  
2. **Add Environment Variables**:
   ```
   NODE_ENV=production
   DB_NAME=biskaken_auto
   DB_USER=postgres
   DB_PASSWORD=YourSecurePassword123
   ```
3. **Deploy**

### Future: Switch to External Database
1. **Comment out internal DB variables**
2. **Uncomment external variables**:
   ```
   NODE_ENV=production
   # DB_NAME=biskaken_auto         # Comment out
   # DB_USER=postgres              # Comment out
   # DB_PASSWORD=YourSecurePassword123  # Comment out
   VITE_API_URL=your_external_api_url  # Uncomment
   ```
3. **Redeploy**

## 🔄 Current Priority

The dashboard follows this priority:
1. **Internal PostgreSQL** (if `INTERNAL_DB=true` and database available)
2. **External API** (if `VITE_API_URL` is uncommented)
3. **External Database** (if `VITE_EXTERNAL_DB_URL` is uncommented)
4. **Demo Data** (always available as fallback)

## ✨ Features with External Databases

All features work with external databases:
- 🚗 **Vehicles & Customers** - Full CRUD operations
- 📋 **Work Orders** - Job tracking and management
- 🧾 **Invoicing** - Billing and payments
- 📦 **Inventory** - Stock management
- 📰 **Blog** - Content management
- 🤖 **AI Diagnosis** - Enhanced with real data

## 🛠️ Expected API Endpoints

Your external API should support these endpoints:
```
GET    /api/customers      - List customers
POST   /api/customers      - Create customer
GET    /api/jobs           - List jobs
POST   /api/jobs           - Create job
GET    /api/inventory      - List inventory
GET    /api/invoices       - List invoices
GET    /api/blog           - List blog posts
```

## 🔐 Authentication

Support for various auth methods:
- **API Keys** - Set `VITE_API_KEY`
- **JWT** - Set `VITE_JWT_SECRET`
- **Basic Auth** - Set `VITE_API_USERNAME` and `VITE_API_PASSWORD`
- **OAuth** - Use service-specific tokens

## 📊 Real-time Status

Dashboard shows connection status:
- 🟢 **Connected** - External API working
- 🟡 **Fallback** - Using demo data
- 🔴 **Error** - Connection issues (check console)

## 🏗️ Example Setups

### Supabase + Dokploy
```bash
# Dokploy Environment Variables:
NODE_ENV=production
VITE_API_URL=https://kxvmkujeipqsctmgufzu.supabase.co/rest/v1
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Firebase + Dokploy
```bash
NODE_ENV=production
VITE_EXTERNAL_DB_URL=https://my-auto-shop-default-rtdb.firebaseio.com
```

### Demo Mode + Dokploy
```bash
NODE_ENV=production
# No API URLs = Demo Mode
```

---

**Flexible. External. Always Working.** 🚀