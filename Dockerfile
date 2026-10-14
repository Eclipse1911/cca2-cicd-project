# ==============================================================================
# Production Dockerfile for CCA-2 Cloud Computing & DevOps Application
# Base: Node.js 20 Alpine (Slim footprint, minimal attack surface ~160MB)
# ==============================================================================

FROM node:20-alpine AS runtime

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create application directory
WORKDIR /usr/src/app

# Install dependencies first (leverages Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy application source code
COPY app/ ./app/

# Switch to unprivileged 'node' user for enhanced container security
USER node

# Expose HTTP port
EXPOSE 3000

# Built-in container healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start Node.js Express server
CMD ["node", "app/server.js"]
