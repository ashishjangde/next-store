# Build stage
FROM node:24-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --legacy-peer-deps

# Copy the rest of the application code into the container
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 5000

# Start the NestJS app in production mode
CMD ["npm", "run", "start:prod"]
