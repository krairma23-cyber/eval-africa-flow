-- CRITICAL SECURITY FIX: Complete privilege escalation fix

-- 1. Add tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'assigned_by'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN assigned_by UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- 2. Migrate data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT 
      user_id,
      CASE 
        WHEN role IN ('member', 'user') THEN 'user'::public.app_role
        WHEN role = 'admin' THEN 'admin'::public.app_role
        WHEN role = 'moderator' THEN 'moderator'::public.app_role
        ELSE 'user'::public.app_role
      END as role
    FROM public.profiles
    WHERE role IS NOT NULL
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- 3. Drop ALL dependent policies
DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "View profiles" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their school" ON public.profiles;
DROP POLICY IF EXISTS "School admins can update school profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "School admins upload logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins update logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins delete logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins create API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School admins update API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School admins delete API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School admins can create API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School admins can update their school's API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School admins can delete their school's API keys" ON public.api_keys;

-- 4. Drop role column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles DROP COLUMN role CASCADE;
  END IF;
END $$;

-- 5. Create secure profiles policies
CREATE POLICY "profiles_insert"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "profiles_update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_admin"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Subscription plans
CREATE POLICY "subscription_plans_admin"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Storage policies
CREATE POLICY "storage_logo_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "storage_logo_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "storage_logo_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

-- 8. API keys
CREATE POLICY "api_keys_admin_all"
ON public.api_keys
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. User roles
DROP POLICY IF EXISTS "View own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can remove roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins delete roles" ON public.user_roles;

CREATE POLICY "user_roles_select"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles_admin_only"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);