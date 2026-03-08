
-- Migrate existing super_admin from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'super_admin'::app_role
FROM public.profiles
WHERE user_type = 'super_admin'
ON CONFLICT (user_id, role) DO NOTHING;
