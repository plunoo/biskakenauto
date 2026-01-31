# 🗄️ External Database Connection Guide

Connect your Biskaken Admin Dashboard to any external database or backend API.

## 🚀 Quick Start

### 1. **Demo Mode** (Default)
No setup required - uses built-in demo data.

### 2. **External API Mode**
Set `VITE_API_URL` to connect to any REST API.

### 3. **External Database Mode** 
Set `VITE_EXTERNAL_DB_URL` for direct database connections.

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

1. **Create Application** in Dokploy
2. **Add Environment Variables**:
   ```
   NODE_ENV=production
   VITE_API_URL=your_external_api_url
   ```
3. **Deploy**

## 🔄 Fallback Behavior

The dashboard follows this priority:
1. **External API** (if `VITE_API_URL` is set)
2. **External Database** (if `VITE_EXTERNAL_DB_URL` is set)
3. **Demo Data** (always available as fallback)

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