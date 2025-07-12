# Use Node.js as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./heidi-gcp/

# Install dependencies
RUN npm ci --only=production

# Copy the app's source code
COPY . .

# Build the Next app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]