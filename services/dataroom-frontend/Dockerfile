# Use slim image to reduce the size of the image
FROM node:21.5-slim

RUN npm install \
    npm install -g serve \
    npm run build

# Set the working directory in the container to /app
WORKDIR /app

COPY . /app

EXPOSE 3000

CMD ["serve", "-s", "build"]
