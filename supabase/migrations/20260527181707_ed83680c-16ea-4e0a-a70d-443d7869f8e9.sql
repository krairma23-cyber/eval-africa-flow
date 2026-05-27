
-- 1) profiles: prevent school_id self-modification
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND NOT (user_type IS DISTINCT FROM (
    SELECT p.user_type FROM public.profiles p WHERE p.user_id = auth.uid()
  ))
  AND NOT (school_id IS DISTINCT FROM (
    SELECT p.school_id FROM public.profiles p WHERE p.user_id = auth.uid()
  ))
);

-- 2) contact_messages: super_admin only for SELECT
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Super admins can read contact messages"
ON public.contact_messages
FOR SELECT
USING (public.is_super_admin(auth.uid()));

-- 3) Evenement: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Public can view active events only" ON public."Evenement";
CREATE POLICY "Authenticated users can view events"
ON public."Evenement"
FOR SELECT
TO authenticated
USING (true);
