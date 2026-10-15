IMAGE := tandava-site
NAME  := tandava-site
PORT  ?= 8080

.PHONY: build run dev stop logs

build:
	docker build -t $(IMAGE) .

# Serve the built image at http://localhost:$(PORT)
run: build stop
	docker run -d --rm --name $(NAME) -p $(PORT):80 $(IMAGE)
	@echo "Tandava is running at http://localhost:$(PORT)"

# Same, but serves this folder directly so edits show up on refresh
dev: build stop
	docker run -d --rm --name $(NAME) -p $(PORT):80 \
		-v "$(CURDIR)":/usr/share/nginx/html:ro $(IMAGE)
	@echo "Tandava (live files) is running at http://localhost:$(PORT)"

stop:
	-@docker rm -f $(NAME) >/dev/null 2>&1

logs:
	docker logs -f $(NAME)
