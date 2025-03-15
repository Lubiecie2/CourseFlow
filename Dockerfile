# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json 
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Open port
EXPOSE 3000

# Run Nuxt
CMD ["npm", "run", "dev"]
