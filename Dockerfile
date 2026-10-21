# Use Node.js 24 with Alpine Linux as the base image
FROM node:24-alpine

WORKDIR /app

# Install the Ionic CLI used to serve the app
RUN npm install -g @ionic/cli

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8100

# Start the Ionic development server, accessible outside the container
CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100", "--no-open"]