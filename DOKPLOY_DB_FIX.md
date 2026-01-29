# 🔧 IMMEDIATE DOKPLOY DATABASE FIX

## 🚨 **Your Error**
```
Database URL configured: postgresql://postgres:@***
socket.gaierror: [Errno -2] Name or service not known
```

## ⚡ **Root Cause**
Missing `DB_PASSWORD` environment variable in Dokploy.

## 🎯 **INSTANT FIX (2 minutes)**

### **Step 1: Add Missing Environment Variable**
1. **Go to Dokploy** → Your service: `biskaken-admin-stack`
2. **Click "Settings"** → **"Environment Variables"**
3. **Add this missing variable**:
   ```
   DB_PASSWORD=YourSecurePassword123!
   ```

### **Step 2: Verify All Required Variables**
Make sure you have ALL of these:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=biskaken_auto
DB_USER=postgres
DB_PASSWORD=YourSecurePassword123!
VITE_API_URL=https://bisadmin.rpnmore.com
NODE_ENV=production
DATABASE_URL=postgresql://postgres:YourSecurePassword123!@postgres:5432/biskaken_auto
```

### **Step 3: Redeploy**
- Click **"Deploy"** or **"Redeploy"**
- Wait for deployment to complete (~2-3 minutes)

## ✅ **Expected Result**
After fix, the logs should show:
```
✅ Database connection pool created successfully
✅ Database connection tested successfully
✅ Demo data seeded successfully
```

And your dashboard will show:
```
🟢 Database Connected • < 50ms
```

## 🔍 **Why This Happened**
The `DB_PASSWORD` environment variable was missing, causing the DATABASE_URL to be malformed:
- **Bad**: `postgresql://postgres:@postgres:5432/biskaken_auto` (missing password)
- **Good**: `postgresql://postgres:YourSecurePassword123!@postgres:5432/biskaken_auto`

The PostgreSQL container couldn't be found because the connection string was invalid.

---

**⚡ This is a 2-minute fix!** Just add the missing `DB_PASSWORD` environment variable and redeploy.