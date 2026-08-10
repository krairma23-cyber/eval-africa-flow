-- contact_messages: remove conflicting always-false insert policy, keep single validated one
DROP POLICY IF EXISTS "Contact messages via function only" ON public.contact_messages;
DROP POLICY IF EXISTS "Public_Contact_Submissions_v2" ON public.contact_messages;
CREATE POLICY "Public contact submissions validated"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) >= 5 AND length(email) <= 254
  AND length(nom) >= 2 AND length(nom) <= 100
  AND length(sujet) >= 5 AND length(sujet) <= 200
  AND length(message) >= 10 AND length(message) <= 2000
);

-- terms: consolidate two overlapping ALL policies into one
DROP POLICY IF EXISTS "Users can access their school terms" ON public.terms;
DROP POLICY IF EXISTS "Users can access their school's terms" ON public.terms;
CREATE POLICY "Users manage their school terms"
ON public.terms
FOR ALL
TO authenticated
USING (
  school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.school_id IS NOT NULL)
)
WITH CHECK (
  school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.user_id = auth.uid() AND p.school_id IS NOT NULL)
);

-- user_roles: consolidate three identical SELECT policies into one
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "v2_user_roles_own_view" ON public.user_roles;
CREATE POLICY "Users view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);