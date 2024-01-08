FROM alpine:latest

# Install nodejs and npm
RUN apk add --update npm

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
