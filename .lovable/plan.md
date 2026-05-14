# Plan de renforcement RGPD & protection des données élèves

Périmètre : base de données uniquement (pas d'Edge Functions). Découpage en lots indépendants pour validation progressive.

## Constat — vulnérabilités critiques identifiées

1. **Fuite multi-tenant sur `profiles`** : la policy *"Admins can view all profiles"* ne filtre pas par `school_id`. Un admin de l'école A peut lire les profils (PII parents/enseignants) de toutes les autres écoles.
2. **Élévation de privilèges sur `students`** : la policy *"School staff can access students"* accorde `ALL` (INSERT/UPDATE/DELETE) à tout membre rattaché à l'école — y compris parents et enseignants qui ne devraient pas pouvoir modifier les fiches élèves.
3. **Notes/bulletins/inscriptions modifiables par tous** : `assessment_results`, `enrollments`, `report_cards` utilisent `ALL` avec `user_belongs_to_school` — un parent ou personnel non enseignant peut altérer ou supprimer notes et bulletins.
4. **Pas de masquage des données médicales** : les champs médicaux/contacts d'urgence sur `students` sont lus en intégralité par toute personne ayant accès à la table.
5. **Aucun parcours RGPD utilisateur** côté UI : pas d'export portabilité ni de suppression de compte self-service.

## Lot 1 — Cloisonnement multi-tenant strict (URGENT)

Migration SQL :
- Remplacer la policy `Admins can view all profiles` par une version filtrée par `school_id` du profil de l'admin connecté.
- Idem pour `Admins can update all profiles`.
- Ajouter fonction `same_school_admin(target_user_id)` SECURITY DEFINER + `SET search_path = public`.

## Lot 2 — Restriction des écritures sensibles

Migration SQL :
- Sur `students` : retirer la policy `School staff can access students` (ALL). La remplacer par :
  - `SELECT` pour staff (`user_belongs_to_school`)
  - `INSERT/UPDATE/DELETE` réservés à `has_role(admin)` + `user_belongs_to_school`
- Sur `assessment_results` : `SELECT` staff/parents (du child) ; `INSERT/UPDATE` réservés enseignants assignés ou admin ; `DELETE` admin uniquement.
- Sur `enrollments` et `report_cards` : `SELECT` staff/parents ; `INSERT/UPDATE/DELETE` admin uniquement.

## Lot 3 — Masquage PII & données médicales

Migration SQL :
- Créer vue `public.students_safe` (security_invoker) excluant : `medical_conditions`, `allergies`, `emergency_contact_*`, `parent_phone`, `parent_email`.
- Créer vue `public.students_medical` accessible uniquement aux admins et infirmier(e) scolaire (rôle dédié si présent, sinon admin).
- Logger chaque SELECT sur les colonnes médicales via trigger → `data_access_logs`.

> Action côté code : adapter les `select('*')` sur `students` pour utiliser `students_safe` partout sauf dans la fiche médicale dédiée.

## Lot 4 — Droits RGPD utilisateurs (UI + RPC)

Migration SQL :
- Fonction `export_user_data(user_id uuid)` SECURITY DEFINER → JSON complet (profil, élèves liés si parent, notes, paiements). Restreinte à `auth.uid() = user_id`.
- Fonction `request_account_deletion(reason text)` → crée une demande dans `account_deletion_requests` (nouvelle table), notifie admin, anonymise après 30 j via cron.

UI (`src/pages/DataPrivacy.tsx`) :
- Section *"Exporter mes données"* (JSON téléchargeable — portabilité art. 20).
- Section *"Supprimer mon compte"* avec délai légal et confirmation double.
- Section *"Mes journaux d'accès"* (lecture de `data_access_logs` filtré sur `auth.uid()`).

## Détails techniques

- Toutes les nouvelles fonctions `SECURITY DEFINER` incluent `SET search_path = public` (règle mémoire).
- Aucune modification à `auth`, `storage`, `realtime`.
- Validation post-migration via le linter Supabase à chaque lot.
- Mise à jour mémoire projet à la fin (`mem://security/...`).

## Hors périmètre (à traiter plus tard)

- Audit Edge Functions (Zod, JWT, logs sans PII).
- Chiffrement applicatif des champs médicaux (au-delà du masquage RLS).
- Rotation automatisée des `api_keys`.

## Ordre d'exécution proposé

Lot 1 → validation → Lot 2 → validation → Lot 3 (impacte code app) → Lot 4 (UI). Chaque lot = une migration revue avant exécution.
