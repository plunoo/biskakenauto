# 🚀 Complete Dokploy Production Setup

## 🎯 IMMEDIATE FIX: Environment Variables for Dokploy

### **Frontend App Settings (biskakenauto.rpnmore.com)**

In your Dokploy frontend application, add these environment variables:

```env
NODE_ENV=production
VITE_API_URL=https://bisadmin.rpnmore.com
VITE_APP_URL=https://biskakenauto.rpnmore.com

# OPTIONAL: AI Features (Get from Google AI Studio)
VITE_GEMINI_API_KEY=your_gemini_key_here
```

### **Backend API Settings (bisadmin.rpnmore.com)**

You need a separate backend application in Dokploy. Create a new Node.js app with these environment variables:

```env
NODE_ENV=production
PORT=5000

# Database Connection (Replace with your actual Dokploy PostgreSQL details)
DATABASE_URL=postgresql://postgres:your_db_password@postgres-container:5432/biskaken_auto
DB_HOST=postgres-container
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long_abcd1234
JWT_EXPIRES_IN=7d

# CORS (Allow frontend to connect)
CORS_ORIGINS=https://biskakenauto.rpnmore.com,http://localhost:3000

# Default Admin Credentials (Change these!)
DEFAULT_ADMIN_EMAIL=admin@biskaken.com
DEFAULT_ADMIN_PASSWORD=change_this_secure_password_123
DEFAULT_ADMIN_NAME=Biskaken Admin
```

## 📊 Database Setup

### **1. Database Schema (Run in your PostgreSQL)**

```sql
-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'STAFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blog posts table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'DRAFT',
    tags TEXT[],
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    vehicle_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: change_this_secure_password_123)
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@biskaken.com', '$2b$10$yourhashedpasswordhere', 'Biskaken Admin', 'ADMIN');
```

### **2. Get Your Dokploy Database Connection Details**

In Dokploy dashboard:
1. Go to your PostgreSQL service
2. Copy connection details:
   - Host (usually `postgres-container` or internal IP)
   - Port (usually `5432`)
   - Database name
   - Username (usually `postgres`)
   - Password (your set password)

## 🔧 Dokploy Setup Steps

### **Step 1: Frontend Application (Already exists)**
- **Domain**: `biskakenauto.rpnmore.com`
- **Type**: Node.js (React build)
- **Add environment variables** from Frontend section above

### **Step 2: Create Backend API Application**
1. **Create new application** in Dokploy
2. **Name**: `biskaken-api` 
3. **Domain**: `bisadmin.rpnmore.com`
4. **Repository**: Same repo, but deploy backend code
5. **Add environment variables** from Backend section above

### **Step 3: Backend Code Setup**

You need a simple Express.js backend. Create this structure:

```
biskaken-api/
├── package.json
├── index.js
├── routes/
│   ├── auth.js
│   ├── blog.js
│   └── customers.js
└── middleware/
    └── auth.js
```

**Basic Express Backend (index.js):**
```javascript
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);
app.use('/customers', require('./routes/customers'));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Biskaken API is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Biskaken API running on port ${PORT}`);
});
```

## 🔑 Admin Login Credentials

### **Default Login (Change these!):**
- **Email**: `admin@biskaken.com`
- **Password**: `change_this_secure_password_123`

### **After Setup:**
1. Login at: `https://biskakenauto.rpnmore.com/admin-login`
2. Change password immediately
3. Create additional staff accounts

## ✅ Testing Checklist

### **1. Test Database Connection:**
```bash
# In Dokploy backend terminal/logs
curl https://bisadmin.rpnmore.com/health
```

### **2. Test Authentication:**
```bash
# Test login endpoint
curl -X POST https://bisadmin.rpnmore.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biskaken.com","password":"change_this_secure_password_123"}'
```

### **3. Test Frontend:**
1. Go to `https://biskakenauto.rpnmore.com/admin-login`
2. Login with admin credentials
3. Check database status in dashboard
4. Try creating a blog post

## 🚨 Common Issues & Fixes

### **"Cannot Login" Error:**
- ✅ Backend API is deployed and running
- ✅ Database connection is working
- ✅ CORS origins include frontend domain
- ✅ Environment variables are set correctly

### **Database Connection Error:**
- ✅ DATABASE_URL format is correct
- ✅ PostgreSQL service is running in Dokploy
- ✅ Database name exists
- ✅ User has correct permissions

### **CORS Error:**
- ✅ CORS_ORIGINS includes your frontend domain
- ✅ Backend allows credentials
- ✅ Frontend sends requests to correct API URL

## 🎯 Next Steps After Setup

1. **Change default passwords**
2. **Set up Gemini AI key** for blog features
3. **Create staff user accounts**
4. **Test blog publishing** to landing page
5. **Set up customer registration** webhook

Your app will be fully functional once both frontend and backend are deployed with these settings! 🚀