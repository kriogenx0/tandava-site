IMAGE := tandava-site
NAME  := tandava-site
PORT  ?= 8080

.PHONY: build run dev stop logs rules rules-check

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

##@ Agent rules

AGENT_RULES ?= $(HOME)/Sites/agent-rules

rules: ## Sync shared agent rules from agent-rules into docs/rules/
	@$(AGENT_RULES)/bin/agent-rules sync "$(CURDIR)"

rules-check: ## Show what `make rules` would change (exit 1 if anything)
	@$(AGENT_RULES)/bin/agent-rules check "$(CURDIR)"
