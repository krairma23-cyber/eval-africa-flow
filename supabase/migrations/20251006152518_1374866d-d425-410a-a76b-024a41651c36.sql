-- Fix is_school_admin to use user_roles table instead of profiles.role
CREATE OR REPLACE FUNCTION public.is_school_admin(p_school_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.user_id = p_user_id 
      AND p.school_id = p_school_id 
      AND ur.role = 'admin'::app_role
  );
$$;