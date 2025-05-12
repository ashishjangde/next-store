# Use the official Node.js slim image
FROM node:23-slim

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code into the container
COPY . .

RUN npm run build

# Expose the application port (changed to 5000)
EXPOSE 5000

# Start the NestJS app in development mode
CMD ["npm", "run", "start:prod"]
