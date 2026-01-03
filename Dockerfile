# Clean Backend-Only Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache bash curl

# Copy backend package files
COPY biskaken-auto-api/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source
COPY biskaken-auto-api/src ./src
COPY biskaken-auto-api/tsconfig.json ./

# Build backend
RUN npm run build

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV ADMIN_EMAIL="admin@biskaken.com"
ENV ADMIN_PASSWORD="admin123"
ENV JWT_SECRET="clean-backend-secret"

EXPOSE 5000

# Start server
CMD ["npm", "start"]