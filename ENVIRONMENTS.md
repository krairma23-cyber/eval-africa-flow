# Environnements EvalScol

Ce document décrit la stratégie multi-environnements adoptée pour protéger les
données réelles des écoles clientes.

## Vue d'ensemble

| Env | Projet Supabase | Données | Qui l'utilise | Paystack |
|---|---|---|---|---|
| **dev** | `evalscol-dev` (à créer) | 100% factices | Développeurs / Lovable | Clés TEST |
| **staging** | `evalscol-staging` (à créer) | Copie anonymisée de la prod | QA, écoles pilotes | Clés TEST |
| **production** | `xckeensgwzwrweloaeoy` (existant) | Données réelles | Écoles clientes | Clés LIVE |

## Configuration côté code

L'application lit `VITE_APP_ENV` pour savoir dans quel environnement elle
tourne. Trois fichiers `.env` sont versionnés comme **modèles** :

- `.env.development.example`
- `.env.staging.example`
- `.env.production.example`

Pour chaque environnement, copier le `.example` vers `.env.<env>` (non
versionné) et y mettre les vraies clés du projet Supabase correspondant.

### Lancer un environnement local

```bash
# Dev (par défaut)
npm run dev

# Staging (utilise .env.staging)
npm run dev -- --mode staging

# Build prod
npm run build
```

### Bannière visuelle

Hors production, un bandeau orange `STAGING` ou ambre `DEV` s'affiche en haut
de chaque écran pour empêcher toute confusion (`src/components/layout/EnvironmentBanner.tsx`).

## Flux de promotion d'une modification

```
1. Lovable code la feature              → DEV
2. Migration validée par l'équipe       → STAGING (recette)
3. Tests fonctionnels OK sur STAGING    → PROD
4. Problème en PROD                     → rollback via Point-in-Time Recovery
```

## Étapes manuelles (hors Lovable)

Lovable ne peut PAS créer de projets Supabase à votre place. À faire une fois :

1. Sur [supabase.com/dashboard](https://supabase.com/dashboard), créer deux
   nouveaux projets :
   - `evalscol-dev`
   - `evalscol-staging`
2. Activer le plan **Pro (25 $/mois)** sur la production pour bénéficier du
   Point-in-Time Recovery (rollback à la seconde près sur 7 jours).
3. Récupérer pour chaque nouveau projet :
   - `Project URL`
   - `anon public key`
4. Les coller dans `.env.development` et `.env.staging` (jamais commiter ces
   fichiers — ils sont déjà ignorés par git).
5. Appliquer le schéma existant aux deux nouveaux projets :
   ```bash
   supabase link --project-ref <ref-dev>
   supabase db push
   supabase link --project-ref <ref-staging>
   supabase db push
   ```
6. Configurer les secrets de chaque projet séparément (Paystack TEST en
   dev/staging, Paystack LIVE en prod).

## Anonymisation prod → staging

Pour rafraîchir staging avec une copie anonymisée de la prod, lancer
manuellement une fois par semaine :

```bash
# Dump structure + data depuis la prod
supabase db dump --project-ref xckeensgwzwrweloaeoy --data-only > /tmp/prod.sql

# Anonymiser (script à compléter selon besoins RGPD)
# - remplacer emails par fake-<id>@evalscol.test
# - remplacer noms/prénoms par valeurs factices
# - vider colonnes médicales et numéros de paiement

# Restaurer sur staging
psql "<staging-connection-string>" < /tmp/prod-anonymized.sql
```

Une edge function dédiée `anonymize-staging` pourra être ajoutée plus tard.

## Recommandation de phasage

- **Phase 1 (maintenant)** : créer DEV + garder PROD. 80% du bénéfice.
- **Phase 2 (≥ 10 écoles clientes)** : ajouter STAGING.
- **Phase 3 (≥ 50 écoles)** : automatiser l'anonymisation par cron.
