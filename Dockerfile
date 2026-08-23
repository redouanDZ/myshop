# Production Dockerfile for MYSHOP
FROM node:20-alpine AS base

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Run production integrity & syntax validation build
RUN npm run build

# Expose server port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start production server
CMD ["node", "server.js"]
