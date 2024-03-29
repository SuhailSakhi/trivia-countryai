# Base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy server's package.json and package-lock.json
COPY chatbot_project/server/package*.json ./server/

# Install server dependencies
RUN cd server && npm install

# Copy the server's source code
COPY chatbot_project/server/ ./server/

# Copy client application to the /app directory
COPY chatbot_project/client/ ./client/

# Expose the port your app runs on
EXPOSE 3000

# Specify the command to run your app
CMD ["node", "server/server.js"]
