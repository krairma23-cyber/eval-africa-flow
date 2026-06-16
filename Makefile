# ============================================================
# EvalScol — Makefile multi-environnements
# ============================================================

.PHONY: help dev dev-staging build build-staging preview deploy-dev deploy-staging deploy-prod deploy-all status

# Couleurs
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Affiche cette aide
	@echo "$(BLUE)EvalScol — Commandes disponibles :$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

dev: ## Lance le serveur local (development)
	@echo "$(BLUE)▶ Serveur local — mode DEVELOPMENT$(NC)"
	npm run dev

dev-staging: ## Lance le serveur local (staging)
	@echo "$(BLUE)▶ Serveur local — mode STAGING$(NC)"
	npm run dev:staging

build: ## Build production
	@echo "$(BLUE)▶ Build PRODUCTION$(NC)"
	npm run build

build-staging: ## Build staging
	@echo "$(BLUE)▶ Build STAGING$(NC)"
	npm run build:staging

preview: ## Preview le dernier build (port 4173)
	@echo "$(BLUE)▶ Preview du build$(NC)"
	npm run preview

deploy-dev: ## Déploie sur evalscol-dev
	@echo "$(YELLOW)▶ Déploiement DEV…$(NC)"
	./scripts/deploy.sh dev

deploy-staging: ## Déploie sur evalscol-staging
	@echo "$(YELLOW)▶ Déploiement STAGING…$(NC)"
	./scripts/deploy.sh staging

deploy-prod: ## Déploie sur evalscol-prod (confirmation)
	@echo "$(YELLOW)▶ Déploiement PROD…$(NC)"
	./scripts/deploy.sh prod

deploy-all: ## Déploie sur DEV puis STAGING
	@echo "$(YELLOW)▶ Déploiement DEV → STAGING…$(NC)"
	./scripts/deploy.sh all

status: ## Vérifie le lien Supabase actuel
	@echo "$(BLUE)▶ Statut Supabase$(NC)"
	supabase status
