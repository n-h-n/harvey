init:
	nvm install 21.2.0
	npm install
	npm install -g serve


serve:
	npm start


serve_prod:
	npm run build && serve -s build

build: 
	docker build \
		--file Dockerfile \
		--tag dataroom-frontend:latest \
		.
.PHONY : build

docker-run: build
	docker run \
	-p 80:80 \
	--env-file .env \
	dataroom-frontend:latest
