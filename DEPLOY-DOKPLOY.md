# Biskaken Auto - Dokploy Deployment Guide

## Simple Docker Compose Deployment

This guide provides a streamlined approach to deploy Biskaken Auto using Dokploy with Docker Compose.

### Prerequisites
- Dokploy instance running
- Domain pointing to your server (A record for `biskakenauto.rpnmore.com`)

### Quick Deployment Steps

1. **Create New Application in Dokploy**
   - Go to your Dokploy dashboard
   - Click "Create Application" 
   - Select "Docker Compose"

2. **Configure Application**
   - **Name**: `biskaken-auto`
   - **Repository**: `https://github.com/plunoo/biskakenauto.git`
   - **Branch**: `main`

3. **Add Docker Compose Configuration**
   In the "Raw" Docker Compose section, paste the contents of `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/biskaken_auto
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
      - ADMIN_EMAIL=admin@biskaken.com
      - ADMIN_PASSWORD=admin123
      - ADMIN_NAME=Admin User
    depends_on:
      db:
        condition: service_healthy
    networks:
      - dokploy-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.biskaken.rule=Host(`biskakenauto.rpnmore.com`)"
      - "traefik.http.routers.biskaken.tls=true"
      - "traefik.http.routers.biskaken.tls.certresolver=letsencrypt"
      - "traefik.http.services.biskaken.loadbalancer.server.port=3000"

  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=biskaken_auto
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dokploy-network

volumes:
  postgres_data:

networks:
  dokploy-network:
    external: true
```

4. **Deploy**
   - Click "Create & Deploy"
   - Monitor logs for deployment progress
   - Database will be automatically created and seeded

### Expected Behavior

1. **Build Process**:
   - Frontend builds first (Vite)
   - Backend installs dependencies
   - Prisma generates client
   - TypeScript compiles
   - Frontend files copied to backend public folder

2. **Startup Sequence**:
   - App waits for PostgreSQL database
   - Runs database migrations
   - Seeds initial data (admin user, sample data)
   - Starts server on port 3000

3. **Access**:
   - Application: `https://biskakenauto.rpnmore.com`
   - Health check: `https://biskakenauto.rpnmore.com/health`

### Default Credentials

- **Admin**: `admin@biskaken.com` / `admin123`
- **Mechanics**: All use password `mechanic123`

### Troubleshooting

#### 1. "No such file or directory: Dockerfile"
If you get this error, it means Dokploy can't find the Dockerfile:
- **Solution 1**: Use the content of `docker-compose.dokploy.yml` instead (includes explicit dockerfile path)
- **Solution 2**: In Dokploy, go to "Advanced Settings" and set Build Context to root directory (.)
- **Solution 3**: Ensure Repository URL and Branch are correct in Dokploy settings

#### 2. Build Errors
- Check if all TypeScript errors are resolved in the latest commit
- Verify all dependencies are properly installed
- Check that `package.json` and `package-lock.json` are present in both root and `biskaken-auto-api` directories

#### 3. Database Connection Issues
- Ensure PostgreSQL service starts successfully (check logs)
- Wait for database health checks to pass before application starts
- Verify DATABASE_URL format is correct

#### 4. Port/Access Issues  
- App runs on port 3000 (configured in Traefik labels)
- Verify domain `biskakenauto.rpnmore.com` points to your server
- Check Dokploy networking configuration

#### 5. SSL/Domain Issues
- Ensure DNS A record points to your server
- Wait for Let's Encrypt certificate generation (may take 1-2 minutes)
- Check Dokploy Traefik configuration

#### 6. If All Else Fails
Try the alternative configuration file:
1. Copy content from `docker-compose.dokploy.yml` 
2. Paste in Dokploy "Raw" Docker Compose section
3. This version has more explicit settings and might work better

### Production Considerations

1. Change JWT_SECRET to a secure random string
2. Use strong database passwords
3. Configure environment-specific values
4. Set up proper backup strategy for `postgres_data` volume
5. Monitor logs and application health

This simplified approach should resolve the previous "Bad Gateway" issues by providing a proper database connection and unified application structure.