# Multi-stage Dockerfile for PTP LinkPulse
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# Copy source and build static frontend
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Create data directory for persistent storage
RUN mkdir -p /app/data

COPY package.json package-lock.json* bun.lock* ./
RUN npm install

# Copy built frontend assets and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts

RUN npm install -g tsx

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["tsx", "server.ts"]
