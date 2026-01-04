# 🚨 Dokploy PostgreSQL Deployment Fix

## Issue: PostgreSQL Database Creation Error
The error `pull access denied for 5432` indicates Dokploy is using the port number as the Docker image name instead of the proper PostgreSQL image.

## ✅ Solution: Correct PostgreSQL Configuration

### Step 1: Create PostgreSQL Database in Dokploy

**In Dokploy Dashboard:**
1. Go to "Services" → "Databases"
2. Click "Create Database"
3. Select "PostgreSQL"

**Correct Configuration:**
```
Name: biskaken-auto-db
Database Name: biskaken_auto
Username: postgres
Password: [Generate strong password - save this!]
Version: latest (or 15)
Port: 5432
```

**Important:** Make sure you're selecting "PostgreSQL" from the database type dropdown, not trying to create a custom Docker service.

### Step 2: Wait for Database to be Ready
- Monitor the database creation in Dokploy
- Wait for status to show "Running"
- Note the internal service name (usually `biskaken-auto-db`)

### Step 3: Update Environment Variables

**Corrected DATABASE_URL format:**
```bash
DATABASE_URL=postgresql://postgres:[YOUR_DB_PASSWORD]@biskaken-auto-db:5432/biskaken_auto
```

**Complete Environment Variables for Dokploy:**
```bash
# Database Connection
DATABASE_URL=postgresql://postgres:[YOUR_DB_PASSWORD]@biskaken-auto-db:5432/biskaken_auto

# Application Settings
NODE_ENV=production
PORT=5000
APP_URL=https://biskakenauto.rpnmore.com

# Security Settings
JWT_SECRET=your-64-character-random-string-here-make-it-very-secure-and-random
JWT_EXPIRES_IN=7d

# Default Admin Account
ADMIN_EMAIL=admin@biskaken.com
ADMIN_PASSWORD=YourSecureAdminPassword123!
ADMIN_NAME=Admin User

# Database Connection Details (for container)
DB_HOST=biskaken-auto-db
DB_PORT=5432
DB_USER=postgres
DB_NAME=biskaken_auto
```

## Alternative: Manual PostgreSQL Setup

If the Dokploy PostgreSQL service continues to have issues, you can create a custom PostgreSQL container:

### Option A: Custom PostgreSQL Service
1. Create "Application" instead of "Database"
2. Choose "Docker" deployment
3. Use this configuration:

**Docker Image:** `postgres:15`
**Environment Variables:**
```bash
POSTGRES_DB=biskaken_auto
POSTGRES_USER=postgres
POSTGRES_PASSWORD=[YOUR_SECURE_PASSWORD]
PGDATA=/var/lib/postgresql/data/pgdata
```

**Volumes:**
```
/var/lib/postgresql/data:/var/lib/postgresql/data
```

**Port:** `5432`

### Option B: External PostgreSQL (Recommended)
Use a managed PostgreSQL service:
- **Railway**: Free PostgreSQL with easy connection
- **Supabase**: Free tier with PostgreSQL
- **PlanetScale**: MySQL alternative
- **Neon**: Serverless PostgreSQL

**Example with Railway:**
1. Create PostgreSQL database on Railway
2. Get connection string like:
   ```
   postgresql://username:password@hostname:5432/database
   ```
3. Use this as your DATABASE_URL in Dokploy

## Updated Deployment Steps

### Step 1: Database Setup
Choose one of these options:
- ✅ **Option A**: Fix Dokploy PostgreSQL service
- ✅ **Option B**: Use external managed database (Railway, Supabase)

### Step 2: Application Deployment
1. Create Docker application in Dokploy
2. Repository: Your Git repo
3. Dockerfile: `./Dockerfile`
4. Domain: `biskakenauto.rpnmore.com`

### Step 3: Environment Variables
Copy all variables from the corrected list above, replacing:
- `[YOUR_DB_PASSWORD]` with actual database password
- `your-64-character-random-string-here-make-it-very-secure-and-random` with actual JWT secret

### Step 4: Deploy and Test
1. Deploy application
2. Monitor logs for database connection
3. Test health endpoints

## Testing Database Connection

Once deployed, verify database connectivity:

```bash
# Test application health
curl https://biskakenauto.rpnmore.com/health

# Test database connection specifically
curl https://biskakenauto.rpnmore.com/api/database/status
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "responseTime": "< 50ms",
    "database": {
      "type": "PostgreSQL",
      "connected": true
    }
  }
}
```

## Troubleshooting

### If Database Still Fails
1. **Check Dokploy Logs**: Look at both database and application logs
2. **Verify Network**: Ensure database and app are in same network
3. **Test Connection**: Try connecting from application container to database
4. **Use External DB**: Switch to Railway/Supabase for reliable database

### Common Issues
- **Wrong image**: Make sure PostgreSQL uses `postgres:15` not `5432`
- **Network isolation**: Database and app must be in same Dokploy network
- **Connection string**: Verify DATABASE_URL format exactly matches PostgreSQL requirements
- **Permissions**: Ensure database user has proper permissions

---

**Once the database is properly created, your deployment should proceed smoothly! The application is fully configured to handle the database setup automatically.**