FROM node:18-alpine

WORKDIR /app

COPY backend-api/package*.json ./

RUN npm ci --omit=dev

COPY backend-api/server.js ./

EXPOSE 5000

CMD ["node", "server.js"]
