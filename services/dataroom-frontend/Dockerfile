# Use slim image to reduce the size of the image
FROM node:21.5-slim

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
ADD . /app

RUN npm install \
    npm install -g serve \
    npm run build

EXPOSE 3000

CMD ["serve", "-s", "build"]
