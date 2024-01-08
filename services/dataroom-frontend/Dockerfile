FROM alpine:latest

ARG REACT_APP_API_BASE_URL=http://dataroom-backend.dataroom.svc.cluster.local:8000

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
