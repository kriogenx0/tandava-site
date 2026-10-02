IMAGE := tandava-site
NAME  := tandava-site
PORT  ?= 8080
ADMIN_TARGET := admin@104.131.183.186

.PHONY: build run dev stop logs deploy install-sudoers

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

# Production deploy: syncs the static files to the server directly (no
# container there -- see deploy/tandavacult.com.conf) and gets/renews the
# cert. Safe to re-run any time the site files change.
#
# install-sudoers needs admin's interactive sudo password the first time
# (deploy has no sudo to install its own rule) -- harmless to re-run after,
# since visudo -c + install just rewrite the same file.
deploy: install-sudoers
	./deploy/deploy.sh

install-sudoers:
	@echo "==> Copying deploy/sudoers.d/tandavacult-com to $(ADMIN_TARGET):/tmp/"
	scp deploy/sudoers.d/tandavacult-com $(ADMIN_TARGET):/tmp/
	@echo "==> Installing it as root (needs your admin password)"
	ssh -t $(ADMIN_TARGET) 'sudo visudo -c -f /tmp/tandavacult-com && sudo install -m 0440 -o root -g root /tmp/tandavacult-com /etc/sudoers.d/tandavacult-com && rm /tmp/tandavacult-com'
