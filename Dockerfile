# Stage 1: Build the frontend, and install server dependencies
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY server/package*.json ./server/

# Install server dependencies first
WORKDIR /app/server
RUN npm ci --only=production

# Install frontend dependencies
WORKDIR /app
RUN npm ci

# Copy all source files
COPY . ./

# Use .env.production as .env for build (contains all Firebase config)
RUN if [ -f .env.production ]; then \
        cp .env.production .env && echo "✓ .env.production copied to .env"; \
    else \
        echo "✗ ERROR: .env.production not found!"; \
        exit 1; \
    fi

# Build the frontend
RUN npm run build && \
    echo "=== Build completed. Verifying dist/index.html ===" && \
    cat dist/index.html | grep "script.*src" && \
    if ! grep -q "assets/main-" dist/index.html; then \
        echo "ERROR: dist/index.html still contains wrong reference!"; \
        cat dist/index.html; \
        exit 1; \
    fi

# Remove source index.html and index.tsx from root (keep only dist/)
RUN rm -f /app/index.html /app/index.tsx


# Stage 2: Build the final server image
FROM node:22-slim

WORKDIR /app

# Copy ONLY specific files from server directory (NOT everything)
COPY --from=builder /app/server/server.js ./server.js
COPY --from=builder /app/server/package.json ./package.json
COPY --from=builder /app/server/package-lock.json ./package-lock.json
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/public ./public

# Copy built frontend assets from the builder stage  
COPY --from=builder /app/dist ./dist

# Verify that index.html in dist/ contains the correct script reference
RUN echo "=== Verifying dist/index.html ===" && \
    if grep -q "assets/main-" ./dist/index.html; then \
        echo "✓ dist/index.html is correct (contains assets/main-*.js)"; \
    else \
        echo "✗ ERROR: dist/index.html does not contain correct reference!"; \
        cat ./dist/index.html; \
        exit 1; \
    fi && \
    echo "=== Listing /app contents ===" && \
    ls -la /app/ && \
    echo "=== Verifying no index.tsx or wrong index.html in /app root ===" && \
    if [ -f /app/index.tsx ]; then echo "ERROR: index.tsx found in /app!"; exit 1; fi && \
    if [ -f /app/index.html ]; then echo "ERROR: index.html found in /app root (should only be in dist/)!"; exit 1; fi

EXPOSE 3000

CMD ["node", "server.js"]
