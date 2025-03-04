# Makefile for Training Hub

# Variables
DOCKER_COMPOSE = docker-compose
NODE = node
NPM = npm

# Colors
CYAN = \033[0;36m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

# Development Commands
.PHONY: install
install: ## Install dependencies
	@echo "$(CYAN)Installing dependencies...$(NC)"
	$(NPM) install

.PHONY: dev
dev: ## Start development server
	@echo "$(CYAN)Starting development server...$(NC)"
	$(NPM) run dev

.PHONY: build
build: ## Build the application
	@echo "$(CYAN)Building application...$(NC)"
	$(NPM) run build

.PHONY: test
test: ## Run tests
	@echo "$(CYAN)Running tests...$(NC)"
	$(NPM) test

.PHONY: lint
lint: ## Run linter
	@echo "$(CYAN)Running linter...$(NC)"
	$(NPM) run lint

.PHONY: format
format: ## Format code
	@echo "$(CYAN)Formatting code...$(NC)"
	$(NPM) run format

# Docker Commands
.PHONY: docker-dev
docker-dev: ## Start Docker development environment
	@echo "$(CYAN)Starting Docker development environment...$(NC)"
	$(NPM) run docker:dev

.PHONY: docker-down
docker-down: ## Stop Docker development environment
	@echo "$(CYAN)Stopping Docker development environment...$(NC)"
	$(NPM) run docker:down

.PHONY: docker-rebuild
docker-rebuild: ## Rebuild Docker containers
	@echo "$(CYAN)Rebuilding Docker containers...$(NC)"
	$(NPM) run docker:rebuild

.PHONY: docker-clean
docker-clean: ## Clean Docker environment
	@echo "$(CYAN)Cleaning Docker environment...$(NC)"
	$(NPM) run docker:clean

.PHONY: docker-test
docker-test: ## Run tests in Docker
	@echo "$(CYAN)Running tests in Docker...$(NC)"
	$(NPM) run docker:test

.PHONY: docker-lint
docker-lint: ## Run linter in Docker
	@echo "$(CYAN)Running linter in Docker...$(NC)"
	$(NPM) run docker:lint

# Setup Commands
.PHONY: setup
setup: ## Initial project setup
	@echo "$(CYAN)Setting up project...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file...$(NC)"; \
		cp .env.example .env; \
	fi
	$(NPM) run setup

.PHONY: setup-docker
setup-docker: ## Initial Docker setup
	@echo "$(CYAN)Setting up Docker environment...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file...$(NC)"; \
		cp docker/.env.example .env; \
	fi
	$(NPM) run docker:dev

# Utility Commands
.PHONY: clean
clean: ## Clean project
	@echo "$(CYAN)Cleaning project...$(NC)"
	$(NPM) run clean

.PHONY: update
update: ## Update dependencies
	@echo "$(CYAN)Updating dependencies...$(NC)"
	$(NPM) update

.PHONY: help
help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@awk -F ':|##' '/^[^\t].+?:.*?##/ { printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$NF }' $(MAKEFILE_LIST)

# Default target
.DEFAULT_GOAL := help
