# Dokploy optimized Dockerfile for backend application
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean install
RUN npm ci --only=production --silent

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (Dokploy will handle port mapping)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const options={host:'localhost',port:5000,path:'/health',timeout:2000};const req=http.request(options,(res)=>{res.statusCode===200?process.exit(0):process.exit(1)});req.on('error',()=>process.exit(1));req.end();"

# Start the application
CMD ["node", "index.js"]