# Invitation des enseignants par email et lien direct

Remplace l'inscription par code d'école partagé par des invitations individuelles, envoyées par l'administrateur.

## Ce que l'utilisateur verra

**Admin (Gestion des utilisateurs / Enseignants)**
- Bouton « Inviter un enseignant » : email, prénom, nom.
- Après envoi : email d'invitation parti automatiquement + lien affiché avec bouton « Copier le lien » (pour WhatsApp/SMS).
- Section « Invitations » dans la liste des utilisateurs : En attente / Acceptée / Expirée / Annulée, date d'envoi, actions « Renvoyer », « Copier le lien », « Annuler ».
- Le lien expire après 7 jours et ne sert qu'une fois.

**Enseignant (page /invitation/:token)**
- Affiche le nom de l'école et l'email invité.
- Pas encore de compte : il choisit son mot de passe, son compte est créé et rattaché à l'école comme enseignant.
- Compte existant (ex. vacataire) : il se connecte, puis clique « Rejoindre cette école » ; l'école s'ajoute à son profil sans perdre la précédente.
- Si plusieurs écoles : sélecteur d'école dans le tableau de bord.

**Code d'école partagé** : l'inscription « Enseignant » par code est retirée du formulaire d'inscription et des Paramètres (le code n'est plus affiché).

## Détails techniques

- Nouvelle table `teacher_invitations` (school_id, email, first_name, last_name, token_hash, status, invited_by, expires_at, accepted_at, accepted_by) — GRANT + RLS : seuls les admins de l'école lisent/gèrent leurs invitations. Le token brut n'est jamais stocké (SHA-256).
- Nouvelle table `school_memberships` (user_id, school_id, role) pour les enseignants multi-établissements ; `profiles.school_id` reste l'école active. Fonction `set_active_school` (SECURITY DEFINER, vérifie l'appartenance) ; les politiques RLS existantes basées sur `get_user_school_id()` continuent de fonctionner sur l'école active.
- Edge Function `teacher-invite` (verify_jwt, Zod, user_id depuis le JWT) : actions `create`, `resend`, `revoke` ; vérifie que l'appelant est admin de l'école, génère le token, envoie l'email via Resend (`evalscolafrica@siteteck.com`), renvoie le lien.
- Edge Function `teacher-invite-accept` : `preview` (public, renvoie école + email masqué), `signup` (crée le compte via service role, email confirmé, rôle teacher, fiche `teachers`), `join` (JWT requis, l'email du compte doit correspondre à l'invitation).
- Désactivation des RPC `join_school_by_code` / `join_school_with_code` pour les nouvelles inscriptions.
- Prérequis : la clé service role doit être disponible pour les Edge Functions (secret `SUPABASE_SERVICE_ROLE_KEY`, présent par défaut sur Supabase).

## Point à valider

Faut-il obliger l'enseignant existant à utiliser **le même email** que celui de l'invitation ? (Proposé : oui, pour la sécurité.)
