# Dokploy Application Dockerfile - Simple Backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const req=http.request({host:'localhost',port:5000,path:'/health',timeout:2000},(res)=>process.exit(res.statusCode===200?0:1));req.on('error',()=>process.exit(1));req.end();"

# Start simple server
CMD ["npm", "run", "start:dokploy"]