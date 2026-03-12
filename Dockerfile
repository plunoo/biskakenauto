# Simple Admin Dashboard Deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
# Install ALL deps (including vite/typescript needed for build)
RUN npm ci

# Copy all source files
COPY . .

# Build the React application
RUN npm run build

# Remove dev deps after build to slim the image
RUN npm prune --production

# Install serve for static hosting
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]