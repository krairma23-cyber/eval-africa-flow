-- 1) profiles: restrict self-update to authenticated and keep privilege fields locked
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- harden trigger: also block privilege field changes made by non-admins on insert-then-update paths
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    RAISE EXCEPTION 'Not allowed to change user_type';
  END IF;
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    RAISE EXCEPTION 'Not allowed to change school_id';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to change user_id';
  END IF;
  RETURN NEW;
END;
$function$;

-- 2) storage school-logos: consolidate duplicate policies (one per operation)
DROP POLICY IF EXISTS "Users can delete logos in their school folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their school logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload logos to their school folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their school logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update logos in their school folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their school logo" ON storage.objects;
DROP POLICY IF EXISTS "Public can view school logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for school logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read school logos" ON storage.objects;

CREATE POLICY "school_logos_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'school-logos');

CREATE POLICY "school_logos_insert_own_school"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "school_logos_update_own_school"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school(((storage.foldername(name))[1])::uuid)
)
WITH CHECK (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY "school_logos_delete_own_school"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school(((storage.foldername(name))[1])::uuid)
);

-- 3) user_plan_features: align management policy with standard service_role pattern
DROP POLICY IF EXISTS "Only service role can manage features" ON public.user_plan_features;
CREATE POLICY "Service role manages plan features"
ON public.user_plan_features
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own features" ON public.user_plan_features;
CREATE POLICY "Users can view their own features"
ON public.user_plan_features
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);