# 🚀 MAKEFILE PER AI PHOTO GALLERY
# Comandi semplificati per sviluppo e deploy

.PHONY: help dev build deploy test clean setup

# ==========================================
# Help
# ==========================================
help: ## Mostra questo help
	@echo "🎯 AI Photo Gallery - Comandi Disponibili:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ==========================================
# Sviluppo
# ==========================================
dev: ## Avvia ambiente sviluppo con Docker
	@echo "🚀 Avviando ambiente sviluppo..."
	docker-compose -f docker-compose.dev.yml up --build

dev-local: ## Sviluppo locale tradizionale
	@echo "⚡ Avviando sviluppo locale..."
	npm run dev

dev-clean: ## Pulisce e riavvia ambiente Docker
	@echo "🧹 Pulizia ambiente Docker..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.dev.yml up --build

# ==========================================
# Firebase
# ==========================================
firebase: ## Avvia Firebase Emulators
	@echo "🔥 Avviando Firebase Emulators..."
	npm run firebase:start

# ==========================================
# Testing
# ==========================================
test-cloudrun: ## Testa localmente (identico a Cloud Run)
	@echo "🧪 Testing locale Cloud Run..."
	npm run test:local-cloudrun

# ==========================================
# Build
# ==========================================
build: ## Build per produzione
	@echo "🏗️ Building per produzione..."
	npm run build

# ==========================================
# Deploy
# ==========================================
deploy: ## Deploy veloce con Cloud Build
	@echo "🚀 Deploy con Cloud Build..."
	npm run deploy:fast

deploy-direct: ## Deploy diretto (più lento)
	@echo "🚢 Deploy diretto su Cloud Run..."
	npm run deploy:direct

# ==========================================
# Utilities
# ==========================================
clean: ## Pulizia completa
	@echo "🧹 Pulizia completa..."
	npm run clean
	npm run clean:docker

setup: ## Setup iniziale progetto
	@echo "⚙️ Setup iniziale..."
	@if [ ! -f .env.local ]; then \
		echo "📝 Creando .env.local..."; \
		cp env.local.example .env.local; \
		echo "✅ Modifica .env.local con le tue configurazioni!"; \
	fi
	npm ci
	@echo "✅ Setup completato!"

logs: ## Visualizza logs Docker
	@echo "📋 Logs containers..."
	docker-compose -f docker-compose.dev.yml logs -f

stop: ## Ferma tutti i container
	@echo "🛑 Fermando containers..."
	docker-compose -f docker-compose.dev.yml down

status: ## Status di tutti i servizi
	@echo "📊 Status servizi..."
	docker-compose -f docker-compose.dev.yml ps

# ==========================================
# Default
# ==========================================
.DEFAULT_GOAL := help








