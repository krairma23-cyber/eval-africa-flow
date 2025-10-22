-- Ajouter le rôle 'teacher' à l'enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- Créer une politique RLS pour permettre aux admins de gérer les rôles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Créer une politique pour que les utilisateurs puissent voir leur propre rôle
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);