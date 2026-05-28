
-- 1. Remove tables from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public."Evenement";
ALTER PUBLICATION supabase_realtime DROP TABLE public."TICKET";
ALTER PUBLICATION supabase_realtime DROP TABLE public."Portfolio";

-- 2. Move id_card_number to a private, access-controlled table
CREATE TABLE public.pme_sensitive_identity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pme_id uuid NOT NULL UNIQUE REFERENCES public.pmes(id) ON DELETE CASCADE,
  id_card_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pme_sensitive_identity TO authenticated;
GRANT ALL ON public.pme_sensitive_identity TO service_role;

ALTER TABLE public.pme_sensitive_identity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins can view pme identity"
ON public.pme_sensitive_identity FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.pmes p WHERE p.id = pme_sensitive_identity.pme_id AND p.user_id = auth.uid())
);

CREATE POLICY "Owners and admins can insert pme identity"
ON public.pme_sensitive_identity FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.pmes p WHERE p.id = pme_sensitive_identity.pme_id AND p.user_id = auth.uid())
);

CREATE POLICY "Owners and admins can update pme identity"
ON public.pme_sensitive_identity FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.pmes p WHERE p.id = pme_sensitive_identity.pme_id AND p.user_id = auth.uid())
);

CREATE POLICY "Admins can delete pme identity"
ON public.pme_sensitive_identity FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.pmes DROP COLUMN IF EXISTS id_card_number;

-- 3. Restrict admin role escalation: only super_admin can grant 'admin' role
DROP POLICY IF EXISTS "Admins manage user roles in their school" ON public.user_roles;
DROP POLICY IF EXISTS "Admins update user roles in their school" ON public.user_roles;
DROP POLICY IF EXISTS "Admins delete user roles in their school" ON public.user_roles;

CREATE POLICY "Admins manage user roles in their school"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND (role <> 'admin'::app_role OR has_role(auth.uid(), 'super_admin'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
);

CREATE POLICY "Admins update user roles in their school"
ON public.user_roles FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND EXISTS (
    SELECT 1 FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND (role <> 'admin'::app_role OR has_role(auth.uid(), 'super_admin'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
);

CREATE POLICY "Admins delete user roles in their school"
ON public.user_roles FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND (role <> 'admin'::app_role OR has_role(auth.uid(), 'super_admin'::app_role))
  AND EXISTS (
    SELECT 1 FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
);
