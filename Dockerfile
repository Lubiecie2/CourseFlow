ARG NODE_VERSION=22.14.0

# Create build stage
FROM node:${NODE_VERSION}-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the working directory
COPY ./package.json /app/
COPY ./package-lock.json /app/
COPY .npmrc /app/

## Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . ./

# Build the application
RUN npm run build

# Create a new stage for the production image
FROM node:${NODE_VERSION}-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the output from the build stage to the working directory
COPY --from=build /app/.output ./

# Expose the port the application will run on
EXPOSE 3000

# Install pm2
RUN npm install pm2@latest -g

# Start the application
CMD ["pm2-runtime", "server/index.mjs"]
