# Simple Node.js Dockerfile for Biskaken Auto Shop Management
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY biskaken-auto-api/package*.json ./biskaken-auto-api/

# Install dependencies
RUN npm ci
RUN cd biskaken-auto-api && npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]