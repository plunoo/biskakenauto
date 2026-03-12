FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Build context is repo root
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production
RUN npm install -g serve

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]
