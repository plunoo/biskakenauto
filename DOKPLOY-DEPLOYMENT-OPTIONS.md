# Biskaken Auto - Dokploy Deployment Options

## Issue: "No such file or directory: Dockerfile"

If you're getting this error, it means Dokploy can't find the Dockerfile. Try these solutions in order:

## Option 1: Simplified Docker Compose (Recommended)

Use the content from `docker-compose.minimal.yml`:

```yaml
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/biskaken_auto
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
      - ADMIN_EMAIL=admin@biskaken.com
      - ADMIN_PASSWORD=admin123
      - ADMIN_NAME=Admin User
    depends_on:
      db:
        condition: service_healthy
    networks:
      - dokploy-network
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.biskaken.rule=Host(`biskakenauto.rpnmore.com`)"
      - "traefik.http.routers.biskaken.tls=true"
      - "traefik.http.routers.biskaken.tls.certresolver=letsencrypt"
      - "traefik.http.services.biskaken.loadbalancer.server.port=3000"

  db:
    image: postgres:16-alpine
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
      start_period: 30s
    networks:
      - dokploy-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  dokploy-network:
    external: true
```

## Option 2: No-Build Approach (If Docker build fails)

Use the content from `docker-compose.simple.yml` - this mounts the source code and builds at runtime:

```yaml
services:
  app:
    image: node:20-alpine
    working_dir: /app
    command: >
      sh -c "
        apk add --no-cache bash curl postgresql-client &&
        npm install &&
        npm run build:frontend &&
        cd biskaken-auto-api &&
        npm install &&
        npx prisma generate &&
        npx tsc &&
        mkdir -p public &&
        cp -r /app/dist/* ./public/ &&
        echo 'Waiting for database...' &&
        until pg_isready -h db -p 5432 -U postgres; do
          echo 'Database not ready, waiting...'
          sleep 3
        done &&
        echo 'Running migrations...' &&
        npx prisma migrate deploy &&
        echo 'Seeding database...' &&
        npx prisma db seed || echo 'Seed completed' &&
        echo 'Starting server...' &&
        node dist/server.js
      "
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/biskaken_auto
      - JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
      - ADMIN_EMAIL=admin@biskaken.com
      - ADMIN_PASSWORD=admin123
      - ADMIN_NAME=Admin User
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - .:/app
    networks:
      - dokploy-network
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.biskaken.rule=Host(`biskakenauto.rpnmore.com`)"
      - "traefik.http.routers.biskaken.tls=true"
      - "traefik.http.routers.biskaken.tls.certresolver=letsencrypt"
      - "traefik.http.services.biskaken.loadbalancer.server.port=3000"

  db:
    image: postgres:16-alpine
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
      start_period: 30s
    networks:
      - dokploy-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  dokploy-network:
    external: true
```

## Option 3: Dokploy Alternative Settings

If both above fail, try these Dokploy settings:

1. **Create Regular Application** (not Docker Compose):
   - Application Type: `Application`
   - Build Type: `Docker`
   - Source: `Git`
   - Repository: `https://github.com/plunoo/biskakenauto.git`
   - Branch: `main`
   - Dockerfile: `Dockerfile` (in root)

2. **Add PostgreSQL Database Separately:**
   - Create Database in Dokploy
   - Type: PostgreSQL
   - Database: `biskaken_auto`
   - Username: `postgres`
   - Password: `postgres`
   - Connect to application via environment variable

3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@[DB_HOST]:5432/biskaken_auto
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
   ADMIN_EMAIL=admin@biskaken.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=Admin User
   ```

## Option 4: Debug the Issue

If nothing works, check these in Dokploy:

1. **Verify Repository Access:**
   - Ensure repository is public or SSH keys are configured
   - Check branch name is correct (`main`)

2. **Check Build Logs:**
   - Look for cloning errors
   - Verify file structure after clone

3. **Manual File Check:**
   - SSH into Dokploy server
   - Check if files are cloned correctly:
     ```bash
     ls -la /path/to/dokploy/app/code/
     ```

## Deployment Steps (Option 1 - Recommended)

1. Go to Dokploy Dashboard
2. Create New Application → Docker Compose
3. Paste Option 1 configuration above
4. Deploy and monitor logs
5. Access: `https://biskakenauto.rpnmore.com`

## Expected Deployment Time

- Build: 2-3 minutes
- Database initialization: 1-2 minutes
- Total: 3-5 minutes

## Default Credentials

- **Admin**: `admin@biskaken.com` / `admin123`
- **Mechanics**: All use password `mechanic123`