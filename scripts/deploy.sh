#!/bin/bash
# ============================================================
# EvalScol — Script de déploiement multi-environnements
# ============================================================
# Usage :
#   ./scripts/deploy.sh dev        → DB push + Edge Functions sur DEV
#   ./scripts/deploy.sh staging    → DB push + Edge Functions sur STAGING
#   ./scripts/deploy.sh prod       → DB push + Edge Functions sur PROD (⚠️)
#   ./scripts/deploy.sh all        → DEV puis STAGING (automatique, non-interactif)
#   ./scripts/deploy.sh schema dev|staging|prod|all   → DB push uniquement
#   ./scripts/deploy.sh functions dev|staging|prod|all → Edge Functions uniquement
#
# Variables d'environnement optionnelles (pour éviter les prompts) :
#   SUPABASE_DEV_DB_PASSWORD       mot de passe DB DEV
#   SUPABASE_STAGING_DB_PASSWORD   mot de passe DB STAGING
#   SUPABASE_PROD_DB_PASSWORD      mot de passe DB PROD
#   SUPABASE_ACCESS_TOKEN          token CLI Supabase (sinon `supabase login`)
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DEV_REF="yaromrihjuokkmemrpac"
STAGING_REF="sfufdufyepjcemstfeuf"
PROD_REF="xckeensgwzwrweloaeoy"

# ----------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------
ref_for() {
  case "$1" in
    dev) echo "$DEV_REF" ;;
    staging) echo "$STAGING_REF" ;;
    prod) echo "$PROD_REF" ;;
    *) echo "" ;;
  esac
}

label_for() {
  case "$1" in
    dev) echo "DEVELOPMENT" ;;
    staging) echo "STAGING" ;;
    prod) echo "PRODUCTION" ;;
    *) echo "$1" ;;
  esac
}

password_for() {
  case "$1" in
    dev) echo "${SUPABASE_DEV_DB_PASSWORD:-}" ;;
    staging) echo "${SUPABASE_STAGING_DB_PASSWORD:-}" ;;
    prod) echo "${SUPABASE_PROD_DB_PASSWORD:-}" ;;
    *) echo "" ;;
  esac
}

link_project() {
  local env=$1
  local ref
  ref=$(ref_for "$env")
  local pwd
  pwd=$(password_for "$env")

  echo -e "${GREEN}→ Lien avec le projet Supabase (${env} / ${ref})...${NC}"
  if [ -n "$pwd" ]; then
    supabase link --project-ref "$ref" --password "$pwd"
  else
    supabase link --project-ref "$ref"
  fi
}

push_schema() {
  local env=$1
  local pwd
  pwd=$(password_for "$env")

  echo -e "${GREEN}→ Push automatique des migrations SQL (${env})...${NC}"
  if [ -n "$pwd" ]; then
    # --include-all force l'envoi de toutes les migrations locales sans prompt
    supabase db push --include-all --password "$pwd" -y || \
      supabase db push --include-all --password "$pwd"
  else
    echo -e "${YELLOW}⚠️  Aucun mot de passe DB fourni pour ${env}, la CLI pourrait demander une saisie.${NC}"
    supabase db push --include-all -y || supabase db push --include-all
  fi
}

deploy_functions() {
  local env=$1
  local ref
  ref=$(ref_for "$env")
  echo -e "${GREEN}→ Déploiement des Edge Functions (${env})...${NC}"
  supabase functions deploy --project-ref "$ref"
}

run_schema() {
  local env=$1
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Schéma → ${YELLOW}$(label_for "$env")${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  link_project "$env"
  push_schema "$env"
  echo -e "${GREEN}✅ Schéma ${env} synchronisé.${NC}\n"
}

run_functions() {
  local env=$1
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Edge Functions → ${YELLOW}$(label_for "$env")${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  link_project "$env"
  deploy_functions "$env"
  echo -e "${GREEN}✅ Edge Functions ${env} déployées.${NC}\n"
}

run_full() {
  local env=$1
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Déploiement complet → ${YELLOW}$(label_for "$env")${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  link_project "$env"
  push_schema "$env"
  deploy_functions "$env"
  echo -e "${GREEN}✅ ${env} entièrement déployé !${NC}\n"
}

confirm_prod() {
  echo -e "${RED}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ⚠️  ATTENTION : action sur PRODUCTION             ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
  read -p "Tape 'oui' pour continuer : " CONFIRM
  [ "$CONFIRM" = "oui" ] || { echo -e "${YELLOW}Annulé.${NC}"; exit 0; }
}

# ----------------------------------------------------------------
# CLI parsing
# ----------------------------------------------------------------
if [ $# -eq 0 ]; then
  echo -e "${RED}Erreur : aucun argument.${NC}"
  echo "Usage : ./scripts/deploy.sh [dev|staging|prod|all] | schema <env> | functions <env>"
  exit 1
fi

CMD=$1
SUB=${2:-}

case "$CMD" in
  dev|staging)
    run_full "$CMD"
    ;;
  prod)
    confirm_prod
    run_full prod
    ;;
  all)
    echo -e "${BLUE}🔄 Déploiement automatique : DEV → STAGING${NC}\n"
    run_full dev
    run_full staging
    echo -e "${GREEN}🎉 DEV et STAGING sont à jour (schéma + fonctions) !${NC}"
    ;;
  schema)
    case "$SUB" in
      dev|staging) run_schema "$SUB" ;;
      prod) confirm_prod; run_schema prod ;;
      all) run_schema dev; run_schema staging ;;
      *) echo -e "${RED}Usage : ./scripts/deploy.sh schema [dev|staging|prod|all]${NC}"; exit 1 ;;
    esac
    ;;
  functions)
    case "$SUB" in
      dev|staging) run_functions "$SUB" ;;
      prod) confirm_prod; run_functions prod ;;
      all) run_functions dev; run_functions staging ;;
      *) echo -e "${RED}Usage : ./scripts/deploy.sh functions [dev|staging|prod|all]${NC}"; exit 1 ;;
    esac
    ;;
  *)
    echo -e "${RED}Commande inconnue : $CMD${NC}"
    echo "Usage : ./scripts/deploy.sh [dev|staging|prod|all] | schema <env> | functions <env>"
    exit 1
    ;;
esac
