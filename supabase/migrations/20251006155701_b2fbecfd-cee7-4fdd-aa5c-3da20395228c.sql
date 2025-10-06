-- Fix is_admin and get_user_role to use user_roles table correctly
-- These functions were referencing a non-existent 'role' column in profiles

-- Fix is_admin to use user_roles table
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role = 'admin'::app_role
  );
$function$;

-- Fix get_user_role to return the first role from user_roles
-- Note: Users can have multiple roles, this returns the first one found
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role::text 
  FROM public.user_roles 
  WHERE user_roles.user_id = $1
  LIMIT 1;
$function$;