# Plan : 3 environnements Dev / Staging / Prod

## Objectif
Protéger les données réelles des écoles : ne plus jamais tester une migration, une edge function ou une nouvelle feature directement sur la base qui contient les vraies notes, paiements et données médicales des élèves.

## Situation actuelle (à risque)
- **Un seul projet Supabase** (`xckeensgwzwrweloaeoy`) contient TOUTES les données réelles
- Chaque migration s'applique directement en production
- Chaque déploiement d'edge function impacte les vraies écoles
- Un bug = perte ou corruption de données réelles, sans filet

## Architecture cible

```text
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│     DEV     │  ──►  │   STAGING   │  ──►  │    PROD     │
│ (bac à      │       │ (recette /  │       │ (vraies     │
│  sable)     │       │  pré-prod)  │       │  écoles)    │
└─────────────┘       └─────────────┘       └─────────────┘
   Supabase A           Supabase B            Supabase C
   données fake         copie anonymisée      données réelles
   tout cassable        tests finaux          intouchable
```

## Les 3 environnements

### 1. DEV — développement quotidien
- **Projet Supabase dédié** (nouveau)
- Données 100% factices (seed avec 2-3 écoles fictives, élèves générés)
- C'est ici que Lovable travaille au jour le jour
- Casser la base = aucun impact

### 2. STAGING — recette / pré-prod
- **Projet Supabase dédié** (nouveau)
- Copie anonymisée de la prod rafraîchie chaque semaine (noms remplacés, emails masqués, paiements neutralisés)
- Sert à valider chaque migration et chaque release avant prod
- Les écoles pilotes peuvent y tester les nouveautés

### 3. PROD — production
- **Projet Supabase actuel** (`xckeensgwzwrweloaeoy`) conservé tel quel
- N'accepte QUE des changements déjà validés en staging
- Sauvegardes quotidiennes + Point-in-Time Recovery activé (Supabase Pro)
- Accès admin restreint

## Flux de promotion d'une modification

```text
1. Lovable code la feature              → testée sur DEV
2. Migration validée par l'équipe       → appliquée sur STAGING
3. Tests de recette OK sur STAGING      → promue en PROD
4. Si problème en PROD                  → rollback via PITR Supabase
```

## Ce qui sera mis en place (côté code)

1. **Variables d'environnement par environnement**
   - `.env.development`, `.env.staging`, `.env.production`
   - Chacun pointe vers son propre `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`

2. **Bannière visuelle d'environnement**
   - Bandeau orange "STAGING — données de test" en haut de l'écran hors prod
   - Évite toute confusion pour les testeurs

3. **Script de seed pour DEV**
   - Crée écoles, classes, élèves, notes fictifs au démarrage
   - Permet à tout dev de repartir d'une base propre

4. **Script d'anonymisation prod → staging**
   - Edge function qui clone la prod en remplaçant : noms, emails, téléphones, numéros de paiement, données médicales
   - À lancer manuellement ou via cron hebdo

5. **Documentation `ENVIRONMENTS.md`**
   - Qui a accès à quoi
   - Procédure de promotion d'une migration
   - Procédure de rollback

## Ce qui doit être fait MANUELLEMENT par vous (hors Lovable)

⚠️ Lovable ne peut PAS créer de nouveaux projets Supabase pour vous. Étapes à faire vous-même :

1. Créer 2 nouveaux projets sur [supabase.com](https://supabase.com/dashboard) :
   - `evalscol-dev`
   - `evalscol-staging`
2. Activer le plan **Pro (25 $/mois par projet)** sur la prod pour avoir le Point-in-Time Recovery (rollback à la seconde près sur 7 jours)
3. Me communiquer les URL + clés anon des 2 nouveaux projets pour que je configure les `.env`

## Coût estimé
- Dev : Free tier Supabase (0 $)
- Staging : Free tier ou Pro selon volume (0 à 25 $/mois)
- Prod : Pro recommandé (25 $/mois) pour PITR
- **Total : 25 à 50 $/mois** pour une sécurité industrielle

## Alternative plus légère (si budget serré)
Si créer 2 projets Supabase est trop tôt, une étape intermédiaire :
- Garder un seul projet Supabase
- Activer **Point-in-Time Recovery** sur la prod (Plan Pro = 25 $/mois)
- Mettre en place une **branche Supabase** (feature payante) pour tester les migrations
- Coût : 25 $/mois, sécurité partielle

## Recommandation
Commencer par **Dev + Prod** (sans staging), c'est 80% du bénéfice pour 50% de l'effort. Ajouter staging plus tard quand vous aurez ≥ 10 écoles clientes.

## Détails techniques

- **Bascule d'environnement** : Vite charge automatiquement le bon `.env.<mode>` selon le script (`vite --mode staging`).
- **Edge functions** : déployées séparément sur chaque projet Supabase via `supabase functions deploy --project-ref <ref>`.
- **Migrations** : le dossier `supabase/migrations/` est versionné une seule fois ; on applique en cascade dev → staging → prod via `supabase db push --project-ref <ref>`.
- **Secrets** : chaque projet Supabase a ses propres secrets (Paystack TEST en dev/staging, Paystack LIVE en prod).
