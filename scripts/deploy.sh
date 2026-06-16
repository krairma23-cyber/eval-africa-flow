#!/bin/bash
# ============================================================
# EvalScol — Script de déploiement multi-environnements
# ============================================================
# Usage :
#   ./scripts/deploy.sh dev      → Déploie sur evalscol-dev
#   ./scripts/deploy.sh staging  → Déploie sur evalscol-staging
#   ./scripts/deploy.sh prod     → Déploie sur evalscol-prod (⚠️)
#   ./scripts/deploy.sh all      → Déploie dev puis staging
# ============================================================

set -euo pipefail

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration des projets
DEV_REF="yaromrihjuokkmemrpac"
STAGING_REF="sfufdufyepjcemstfeuf"
PROD_REF="xckeensgwzwrweloaeoy"

deploy_env() {
  local env_name=$1
  local project_ref=$2

  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  Déploiement sur ${YELLOW}${env_name}${BLUE} (${project_ref})${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

  echo -e "${GREEN}→ Lien avec le projet Supabase...${NC}"
  supabase link --project-ref "${project_ref}"

  echo -e "${GREEN}→ Push des migrations SQL...${NC}"
  supabase db push

  echo -e "${GREEN}→ Déploiement des Edge Functions...${NC}"
  supabase functions deploy --project-ref "${project_ref}"

  echo -e "${GREEN}✅ ${env_name} déployé avec succès !${NC}\n"
}

# Vérification des arguments
if [ $# -eq 0 ]; then
  echo -e "${RED}Erreur : aucun environnement spécifié.${NC}"
  echo "Usage : ./scripts/deploy.sh [dev | staging | prod | all]"
  exit 1
fi

ENV=$1

case $ENV in
  dev)
    deploy_env "DEVELOPMENT" "$DEV_REF"
    ;;
  staging)
    deploy_env "STAGING" "$STAGING_REF"
    ;;
  prod)
    echo -e "${RED}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  ATTENTION : déploiement sur PRODUCTION       ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════╝${NC}"
    read -p "Es-tu sûr ? Tape 'oui' pour continuer : " CONFIRM
    if [ "$CONFIRM" = "oui" ]; then
      deploy_env "PRODUCTION" "$PROD_REF"
    else
      echo -e "${YELLOW}Annulé.${NC}"
      exit 0
    fi
    ;;
  all)
    echo -e "${BLUE}Déploiement automatique : DEV → STAGING${NC}\n"
    deploy_env "DEVELOPMENT" "$DEV_REF"
    deploy_env "STAGING" "$STAGING_REF"
    echo -e "${GREEN}🎉 Les deux environnements sont à jour !${NC}"
    ;;
  *)
    echo -e "${RED}Environnement inconnu : $ENV${NC}"
    echo "Usage : ./scripts/deploy.sh [dev | staging | prod | all]"
    exit 1
    ;;
esac
