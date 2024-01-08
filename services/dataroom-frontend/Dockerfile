# Use slim image to reduce the size of the image
FROM node:21.5-slim

# Set the working directory in the container to /app
WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

RUN npm install -g serve \
    npm run build

COPY . .

EXPOSE 3000

CMD ["serve", "-s", "build"]
