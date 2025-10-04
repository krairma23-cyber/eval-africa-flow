-- CRITICAL SECURITY FIX: Remove all role column dependencies

-- 1. Add tracking columns to user_roles
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

-- 2. Migrate role data
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

-- 3. Drop ALL policies that depend on profiles.role
DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;
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

-- Drop subscription_plans policies
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON public.subscription_plans;

-- Drop storage policies  
DROP POLICY IF EXISTS "School admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can delete logos" ON storage.objects;

-- Drop api_keys policies
DROP POLICY IF EXISTS "School admins can create API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School admins can update their school's API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School admins can delete their school's API keys" ON public.api_keys;

-- 4. Now drop the role column with CASCADE
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

-- 5. Recreate profiles policies securely
CREATE POLICY "Insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "View profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Recreate subscription_plans policies
CREATE POLICY "Admins manage plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Recreate storage policies
CREATE POLICY "School admins upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

-- 8. Recreate api_keys policies
CREATE POLICY "School admins create API keys"
ON public.api_keys
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins update API keys"
ON public.api_keys
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins delete API keys"
ON public.api_keys
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Secure user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can modify roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can remove roles" ON public.user_roles;

CREATE POLICY "View own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins modify roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);