FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Build context is repo root — all paths prefixed with backend-api/
COPY backend-api/package*.json ./
RUN npm ci --only=production

COPY backend-api/server.js ./
COPY backend-api/src/ ./src/
COPY backend-api/models/ ./models/

RUN mkdir -p public/uploads/tmp

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
