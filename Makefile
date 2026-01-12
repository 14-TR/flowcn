.PHONY: help dev build test clean install shell

help:
	@echo "flowcn - Docker-based development commands"
	@echo ""
	@echo "Usage:"
	@echo "  make dev       - Start development server with hot reload"
	@echo "  make build     - Build all packages and apps"
	@echo "  make test      - Run all tests"
	@echo "  make install   - Install dependencies"
	@echo "  make shell     - Open a shell in the dev container"
	@echo "  make clean     - Clean Docker volumes and images"

dev:
	docker compose up dev

build:
	docker compose run --rm dev pnpm build

test:
	docker compose run --rm dev pnpm test

install:
	docker compose run --rm dev pnpm install

shell:
	docker compose run --rm dev sh

clean:
	docker compose down -v
	docker rmi flowcn-dev flowcn-prod 2>/dev/null || true
