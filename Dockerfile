# Use official Node.js LTS image
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend and backend bundle
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built assets and server bundle from builder stage
COPY --from=builder /app/dist ./dist

# Environment settings
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start server
CMD ["npm", "start"]
