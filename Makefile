ifeq ($(OS),Windows_NT)
SHELL := sh.exe
.SHELLFLAGS := -c
else
SHELL := /bin/bash
endif
.DEFAULT_GOAL := help

ifneq (,$(wildcard .env))
include .env
export
endif

ENV         ?= dev
BUN         ?= bun
TURBO       ?= $(BUN) x turbo
NODE_ENV    ?= development

ADMIN_DIR   := apps/admin
WEB_DIR     := apps/web
MOBILE_DIR  := apps/mobile
UI_DIR      := packages/ui
CORE_DIR    := packages/core

##@ Help

.PHONY: help
help: ## Liste les targets groupés par section
	@awk 'BEGIN { FS = ":.*?##[ @]" } \
	      /^##@ / { printf "\n\033[1;33m%s\033[0m\n", substr($$0, 5); next } \
	      /^[a-zA-Z0-9_-]+:.*?## / { printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2 }' \
	      $(MAKEFILE_LIST)
	@echo -e "\n\033[1;33mVariables\033[0m  ENV=$(ENV) · BUN=$(BUN) · NODE_ENV=$(NODE_ENV)"

##@ Bootstrap - install + setup

.PHONY: install
install: ## Installe toutes les dépendances (Bun workspaces)
	$(BUN) install

.PHONY: prepare
prepare: ## Init Husky (hooks pre-commit + commit-msg)
	$(BUN) run prepare

.PHONY: setup
setup: install prepare ## Bootstrap complet (install + husky)
	@echo "[setup] OK · run 'make dev' to start"

##@ Dev - hot reload sur les 3 surfaces

.PHONY: dev
dev: ## Lance admin + web + mobile en parallèle (Turbo)
	$(BUN) run dev

.PHONY: dev-admin
dev-admin: ## Back-office uniquement (port 3001)
	$(BUN) run dev:admin

.PHONY: dev-web
dev-web: ## Site public uniquement (port 3000)
	$(BUN) run dev:web

.PHONY: dev-mobile
dev-mobile: ## Vue mobile uniquement (port 3002)
	$(BUN) run dev:mobile

##@ Build - production builds

.PHONY: build
build: ## Build tous les apps (Turbo cache)
	$(BUN) run build

.PHONY: build-admin
build-admin: ## Build admin seulement
	$(TURBO) run build --filter=@lumiris/admin

.PHONY: build-web
build-web: ## Build web seulement
	$(TURBO) run build --filter=@lumiris/web

.PHONY: build-mobile
build-mobile: ## Build mobile seulement
	$(TURBO) run build --filter=@lumiris/mobile

.PHONY: start
start: ## Démarre tous les apps en mode prod
	$(BUN) run start

##@ Code quality - lint · format · typecheck · test

.PHONY: lint
lint: ## ESLint sur tous les workspaces (check)
	$(BUN) run lint

.PHONY: lint-fix
lint-fix: ## ESLint auto-fix
	$(BUN) run lint:fix

.PHONY: lint-css
lint-css: ## Stylelint sur le DS et globals
	$(BUN) run lint:css

.PHONY: format
format: ## Prettier sur tous les fichiers
	$(BUN) run format

.PHONY: format-check
format-check: ## Prettier check (CI-friendly)
	$(BUN) run format:check

.PHONY: typecheck
typecheck: ## TypeScript strict sur tous les workspaces
	$(BUN) run typecheck

.PHONY: test
test: ## Tests Bun + Vitest (selon les workspaces)
	$(BUN) run test

.PHONY: knip
knip: ## Code mort + deps inutilisées
	$(BUN) run knip

.PHONY: knip-fix
knip-fix: ## Knip + auto-fix des deps en trop
	$(BUN) run knip:fix

.PHONY: check
check: lint lint-css typecheck test ## Quality gate complet (avant commit)

.PHONY: fix
fix: ## Auto-fix tout (lint + css + format)
	$(BUN) run fix

##@ Performance - Lighthouse + Web Vitals

.PHONY: lhci
lhci: ## Lighthouse CI sur le web public
	$(BUN) run lhci

.PHONY: lighthouse-mobile
lighthouse-mobile: ## Audit Lighthouse mobile profile (URL=http://localhost:3000)
	@test -n "$(URL)" || { echo "Usage: URL=<url> make lighthouse-mobile"; exit 1; }
	bunx lighthouse "$(URL)" --output=html --output-path=./.lighthouse-mobile.html --quiet

.PHONY: lighthouse-desktop
lighthouse-desktop: ## Audit Lighthouse desktop profile (URL=http://localhost:3000)
	@test -n "$(URL)" || { echo "Usage: URL=<url> make lighthouse-desktop"; exit 1; }
	bunx lighthouse "$(URL)" --preset=desktop --output=html --output-path=./.lighthouse-desktop.html --quiet

##@ Tauri - app mobile native (à activer après prompt #1)

TAURI_DIR := $(MOBILE_DIR)/src-tauri

.PHONY: tauri-init
tauri-init: ## Initialise Tauri 2.0 dans apps/mobile (one-shot)
	@test ! -d "$(TAURI_DIR)" || { echo "[tauri-init] $(TAURI_DIR) existe déjà"; exit 1; }
	cd $(MOBILE_DIR) && bunx @tauri-apps/cli@latest init
	@echo "[tauri-init] OK · run 'make tauri-dev' pour démarrer"

.PHONY: tauri-dev
tauri-dev: ## Mode dev Tauri (HMR Next + bridge Rust)
	@test -d "$(TAURI_DIR)" || { echo "[tauri-dev] lance d'abord 'make tauri-init'"; exit 1; }
	cd $(MOBILE_DIR) && bunx @tauri-apps/cli@latest dev

.PHONY: tauri-build
tauri-build: ## Build Tauri release (binaires natifs platform-specific)
	@test -d "$(TAURI_DIR)" || { echo "[tauri-build] lance d'abord 'make tauri-init'"; exit 1; }
	cd $(MOBILE_DIR) && bunx @tauri-apps/cli@latest build

.PHONY: tauri-android-init
tauri-android-init: ## Bootstrap target Android (NDK requis)
	cd $(MOBILE_DIR) && bunx @tauri-apps/cli@latest android init

.PHONY: tauri-android-dev
tauri-android-dev: ## Dev sur émulateur/device Android
	cd $(MOBILE_DIR) && bunx @tauri-apps/cli@latest android dev

.PHONY: tauri-ios-init
tauri-ios-init: ## Bootstrap target iOS (Xcode requis, macOS only)
	cd $(MOBILE_DIR) && bunx @tauri-apps/cli@latest ios init

.PHONY: tauri-ios-dev
tauri-ios-dev: ## Dev sur simulateur/device iOS
	cd $(MOBILE_DIR) && bunx @tauri-apps/cli@latest ios dev

##@ Observability - Tempo + Prometheus + Loki + Grafana

COMPOSE_MONITORING := docker compose -f docker-compose.monitoring.yml --profile monitoring
GRAFANA_URL ?= http://localhost:3030
PROM_URL    ?= http://localhost:9090

.PHONY: monitoring-up
monitoring-up: ## Lance Tempo + Prometheus + Loki + Grafana (profile monitoring)
	$(COMPOSE_MONITORING) up -d
	@echo ""
	@echo -e "  \033[1;32mGrafana\033[0m     $(GRAFANA_URL)        (anon admin)"
	@echo -e "  \033[1;32mPrometheus\033[0m  $(PROM_URL)"
	@echo -e "  \033[1;32mTempo OTLP\033[0m  http://localhost:4318  (HTTP)"
	@echo -e "  \033[1;32mLoki\033[0m        http://localhost:3100"
	@echo ""
	@echo "  Dashboard: $(GRAFANA_URL)/d/lumiris-overview"

.PHONY: monitoring-down
monitoring-down: ## Stoppe la stack observabilité (volumes conservés)
	$(COMPOSE_MONITORING) down

.PHONY: monitoring-nuke
monitoring-nuke: ## Stoppe et SUPPRIME les volumes (perte de données Prom/Tempo/Loki)
	$(COMPOSE_MONITORING) down -v

.PHONY: monitoring-logs
monitoring-logs: ## Tail des logs des 4 services
	$(COMPOSE_MONITORING) logs -f --tail=100

.PHONY: monitoring-reload
monitoring-reload: ## Reload Prom rules + datasources sans restart
	curl -sS -X POST $(PROM_URL)/-/reload && echo "[prom] config reloaded"

.PHONY: slo
slo: ## Affiche l'état des SLOs (availability + p95 score latency)
	@echo -e "\033[1;33m# Availability (30d, target 99.9%)\033[0m"
	@curl -sG --data-urlencode 'query=lumiris:api_availability_30d' \
	    $(PROM_URL)/api/v1/query | \
	    awk -F'"value":\\[[^,]+,"' '{ if (NF>1) print "  " substr($$2, 1, index($$2,"\"")-1); else print "  no data" }'
	@echo -e "\033[1;33m# Score latency p95 (5m, target <250ms)\033[0m"
	@curl -sG --data-urlencode 'query=lumiris:score_latency_p95_5m' \
	    $(PROM_URL)/api/v1/query | \
	    awk -F'"value":\\[[^,]+,"' '{ if (NF>1) print "  " substr($$2, 1, index($$2,"\"")-1) "s"; else print "  no data" }'
	@echo -e "\033[1;33m# Active SLO alerts\033[0m"
	@curl -sG --data-urlencode 'query=ALERTS{slo!=""}' \
	    $(PROM_URL)/api/v1/query | \
	    grep -oE '"alertname":"[^"]+"' | sort -u | sed 's/^/  /' || echo "  (none firing)"

##@ Maintenance - clean + reset

.PHONY: clean
clean: ## Nettoie .next + .turbo + dist
	$(BUN) run clean

.PHONY: clean-all
clean-all: ## Tout nettoyer (y compris node_modules)
	$(BUN) run clean:all

.PHONY: reset
reset: clean-all install ## Reset complet (dernière chance)

.PHONY: doctor
doctor: ## Vérifie les versions des outils requis
	@echo -e "\033[1;33m# Versions installées\033[0m"
	@printf "  bun         : "; bun --version 2>/dev/null || echo MISSING
	@printf "  node        : "; node --version 2>/dev/null || echo MISSING
	@printf "  rustc       : "; rustc --version 2>/dev/null || echo "(facultatif - requis pour Tauri)"
	@printf "  cargo       : "; cargo --version 2>/dev/null || echo "(facultatif - requis pour Tauri)"
	@printf "  git         : "; git --version 2>/dev/null || echo MISSING

##@ CI - pipeline local complet

.PHONY: ci
ci: install check build ## Pipeline CI exécuté localement (install + check + build)

##@ Docker - images par app · multi-stage Bun

GIT_SHA       := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)
IMAGE_TAG     ?= $(GIT_SHA)
GHCR_OWNER    ?= lumiris
REGISTRY      ?= ghcr.io
APPS          := admin web mobile api

.PHONY: docker-build
docker-build: ## Build les 4 images (admin, web, mobile, api) — IMAGE_TAG=<sha>
	@for app in $(APPS); do \
	  echo "[docker-build] $$app:$(IMAGE_TAG)"; \
	  docker build \
	    -f apps/$$app/Dockerfile \
	    -t $(REGISTRY)/$(GHCR_OWNER)/$$app:$(IMAGE_TAG) \
	    . || exit 1; \
	done

.PHONY: docker-build-app
docker-build-app: ## Build une seule image (APP=admin|web|mobile|api)
	@test -n "$(APP)" || { echo "Usage: APP=<admin|web|mobile|api> make docker-build-app"; exit 1; }
	docker build -f apps/$(APP)/Dockerfile -t $(REGISTRY)/$(GHCR_OWNER)/$(APP):$(IMAGE_TAG) .

.PHONY: docker-push
docker-push: ## Pousse les 4 images vers GHCR (login préalable requis)
	@for app in $(APPS); do \
	  docker push $(REGISTRY)/$(GHCR_OWNER)/$$app:$(IMAGE_TAG) || exit 1; \
	done

##@ Stack - docker compose (dev/prod)

COMPOSE_FILES := -f docker-compose.yml -f docker-compose.$(ENV).yml
COMPOSE_STACK := IMAGE_TAG=$(IMAGE_TAG) GHCR_OWNER=$(GHCR_OWNER) docker compose $(COMPOSE_FILES)

.PHONY: stack-up
stack-up: ## Démarre la stack (ENV=dev|prod, IMAGE_TAG=<sha>)
	$(COMPOSE_STACK) up -d

.PHONY: stack-down
stack-down: ## Stoppe la stack
	$(COMPOSE_STACK) down

.PHONY: stack-logs
stack-logs: ## Logs en suivi (SVC=api pour un seul service)
	$(COMPOSE_STACK) logs -f $(SVC)

.PHONY: stack-ps
stack-ps: ## Liste les services en cours
	$(COMPOSE_STACK) ps

##@ Deploy - zero-downtime sur le VPS

HEALTH_TIMEOUT ?= 240
DEPLOY_SVCS    ?= admin web mobile api

.PHONY: deploy-zd
deploy-zd: ## Zero-downtime deploy (IMAGE_TAG=<sha>) — scale +1 → wait healthy → scale -1
	@test "$(IMAGE_TAG)" != "latest" || { echo "[deploy-zd] refus: IMAGE_TAG=latest interdit en prod"; exit 1; }
	@echo "[deploy-zd] tag=$(IMAGE_TAG) timeout=$(HEALTH_TIMEOUT)s"
	@$(COMPOSE_STACK) pull $(DEPLOY_SVCS)
	@for svc in $(DEPLOY_SVCS); do \
	  current=$$($(COMPOSE_STACK) ps --quiet $$svc | wc -l); \
	  target=$$((current + 1)); \
	  echo "[deploy-zd] $$svc: scale $$current → $$target (start-first)"; \
	  $(COMPOSE_STACK) up -d --no-deps --scale $$svc=$$target --no-recreate $$svc || exit 1; \
	  echo "[deploy-zd] $$svc: waiting healthy ($(HEALTH_TIMEOUT)s)"; \
	  deadline=$$(( $$(date +%s) + $(HEALTH_TIMEOUT) )); \
	  while [ $$(date +%s) -lt $$deadline ]; do \
	    healthy=$$($(COMPOSE_STACK) ps --format '{{.Service}} {{.Health}}' | grep "^$$svc " | grep -c healthy); \
	    if [ $$healthy -ge $$target ]; then echo "[deploy-zd] $$svc: $$healthy/$$target healthy"; break; fi; \
	    sleep 5; \
	  done; \
	  if [ $$(date +%s) -ge $$deadline ]; then \
	    echo "[deploy-zd] $$svc: health timeout — rolling back"; \
	    exit 1; \
	  fi; \
	  echo "[deploy-zd] $$svc: scale $$target → $$current (drain old)"; \
	  $(COMPOSE_STACK) up -d --no-deps --scale $$svc=$$current --remove-orphans $$svc || exit 1; \
	done
	@echo "[deploy-zd] OK · all services on $(IMAGE_TAG)"

.PHONY: rollback
rollback: ## Rollback vers un tag précédent (TAG=<sha>)
	@test -n "$(TAG)" || { echo "Usage: make rollback TAG=<sha>"; exit 1; }
	@echo "[rollback] tag=$(TAG)"
	IMAGE_TAG=$(TAG) $(COMPOSE_STACK) pull $(DEPLOY_SVCS)
	IMAGE_TAG=$(TAG) $(COMPOSE_STACK) up -d --no-deps $(DEPLOY_SVCS)
	@echo "[rollback] OK · stack restored to $(TAG)"

##@ SBOM - syft + cosign

SBOM_DIR ?= sbom

.PHONY: sbom
sbom: ## Génère un SBOM SPDX-JSON par image (IMAGE_TAG=<sha>) — requiert syft
	@command -v syft >/dev/null 2>&1 || { echo "[sbom] syft missing — https://github.com/anchore/syft"; exit 1; }
	@mkdir -p $(SBOM_DIR)
	@for app in $(APPS); do \
	  out="$(SBOM_DIR)/$$app-$(IMAGE_TAG).spdx.json"; \
	  echo "[sbom] $$app → $$out"; \
	  syft "$(REGISTRY)/$(GHCR_OWNER)/$$app:$(IMAGE_TAG)" -o spdx-json="$$out" || exit 1; \
	done
	@echo "[sbom] OK · $(SBOM_DIR)/"

.PHONY: sbom-sign
sbom-sign: ## Signe les SBOMs avec cosign keyless (OIDC)
	@command -v cosign >/dev/null 2>&1 || { echo "[sbom-sign] cosign missing"; exit 1; }
	@for app in $(APPS); do \
	  cosign attest --yes \
	    --predicate $(SBOM_DIR)/$$app-$(IMAGE_TAG).spdx.json \
	    --type spdxjson \
	    "$(REGISTRY)/$(GHCR_OWNER)/$$app:$(IMAGE_TAG)" || exit 1; \
	done

##@ Bench - k6 charge tests

BENCH_DIR     := bench
BENCH_OUT     := $(BENCH_DIR)/out
SCENARIO      ?= scoring
BENCH_BASE    ?= http://localhost:4000
BENCH_PROD    ?= https://api.lumiris.io

.PHONY: bench-local
bench-local: ## k6 local (SCENARIO=browse|audit|scoring · BASE=<url>)
	@command -v k6 >/dev/null 2>&1 || { echo "[bench] k6 missing — https://k6.io/docs/get-started/installation/"; exit 1; }
	@test -f $(BENCH_DIR)/scenarios/$(SCENARIO).js || { echo "[bench] unknown SCENARIO=$(SCENARIO)"; exit 1; }
	@mkdir -p $(BENCH_OUT)
	BASE=$(BENCH_BASE) k6 run $(BENCH_DIR)/scenarios/$(SCENARIO).js

.PHONY: bench-prod
bench-prod: ## k6 prod (DANGER: vérifie l'autorisation infra · BASE=<url>)
	@command -v k6 >/dev/null 2>&1 || { echo "[bench] k6 missing"; exit 1; }
	@echo "[bench-prod] cible=$(BENCH_PROD) — assure-toi d'avoir l'OK infra"
	@mkdir -p $(BENCH_OUT)
	BASE=$(BENCH_PROD) k6 run $(BENCH_DIR)/scenarios/$(SCENARIO).js

##@ Release - tag + push (déclenche workflow release)

.PHONY: release
release: ## Tag + push (VERSION=v0.1.0) — GitHub Actions construit, signe et pousse
	@test -n "$(VERSION)" || { echo "Usage: VERSION=v0.1.0 make release"; exit 1; }
	@echo "$(VERSION)" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.-]+)?$$' \
	  || { echo "[release] version invalide (semver attendu, ex: v0.1.0)"; exit 1; }
	git tag -a $(VERSION) -m "release $(VERSION)"
	git push origin $(VERSION)
	@echo "[release] tag $(VERSION) poussé"
