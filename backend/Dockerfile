# Build stage
FROM node:24-slim AS builder

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Copy prisma schema before installing dependencies
COPY prisma ./prisma

# Install all dependencies (including dev dependencies for building)
RUN npm ci --legacy-peer-deps

# Generate Prisma Client after dependencies are installed
RUN npx prisma generate

# Copy the rest of the application code into the container
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-slim

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for production dependencies
COPY package*.json ./

# Copy prisma schema before installing dependencies
COPY prisma ./prisma

# Install only production dependencies
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Generate Prisma Client in production stage after dependencies are installed
RUN npx prisma generate

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy .env file if it exists (this will be injected by Jenkins)
COPY .env* ./

# Expose the application port
EXPOSE 8000


# Start the NestJS app in production mode
CMD ["node", "dist/src/main"]
