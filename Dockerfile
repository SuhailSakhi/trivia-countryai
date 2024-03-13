# Base image
FROM node:18

# Create app directory
WORKDIR /app/server

# Copy server's package.json and package-lock.json
COPY server/package*.json ./

# Install server dependencies
RUN npm install

# Copy the rest of the server's source code
COPY server/ ./

# Copy client application to the /app directory
COPY client/ ./client/

# Expose the port your app runs on
EXPOSE 3000

# Specify the command to run your app
CMD ["node", "server.js"]
