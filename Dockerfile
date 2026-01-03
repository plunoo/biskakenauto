# Simple frontend-only Dockerfile for Dokploy
FROM node:20-alpine AS builder

WORKDIR /app

# Copy source code first
COPY . .

# Install dependencies (including dev deps for build)
RUN npm ci

# Build frontend only
RUN npm run build:frontend

# Production nginx stage
FROM nginx:alpine

# Copy built frontend to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]