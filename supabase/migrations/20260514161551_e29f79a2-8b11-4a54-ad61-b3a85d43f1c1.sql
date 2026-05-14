-- Helper: admin de la même école que l'utilisateur cible
CREATE OR REPLACE FUNCTION public.same_school_admin(_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles me
    JOIN public.profiles target ON target.user_id = _target_user_id
    WHERE me.user_id = auth.uid()
      AND me.school_id IS NOT NULL
      AND me.school_id = target.school_id
      AND public.has_role(auth.uid(), 'admin'::app_role)
  );
$$;

-- Remplacer la policy SELECT trop permissive
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins view profiles in their school"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.same_school_admin(user_id));

-- Remplacer la policy UPDATE trop permissive
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins update profiles in their school"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.same_school_admin(user_id))
WITH CHECK (public.same_school_admin(user_id));