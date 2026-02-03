# Stage 1: Development
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all app files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite in dev mode and listen on all interfaces
CMD ["npm", "run", "dev", "--", "--host"]



