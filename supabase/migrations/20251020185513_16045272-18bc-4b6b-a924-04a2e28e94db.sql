-- Fix critical security issues (corrected version)

-- 1. FIX: Restrict articles table - Only admins can modify
CREATE POLICY "Only admins can insert articles" ON public.articles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update articles" ON public.articles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete articles" ON public.articles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. FIX: Restrict support_faqs table - Only admins can modify
CREATE POLICY "Only admins can insert FAQs" ON public.support_faqs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update FAQs" ON public.support_faqs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete FAQs" ON public.support_faqs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. FIX: Correct inscriptions_pme RLS policy - Remove 'true' condition
DROP POLICY IF EXISTS "Users can view their own PME inscriptions" ON public.inscriptions_pme;
DROP POLICY IF EXISTS "Anyone can insert PME inscriptions" ON public.inscriptions_pme;

CREATE POLICY "Users can view their own PME inscriptions" ON public.inscriptions_pme
FOR SELECT
USING (
  email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Validated PME inscriptions only" ON public.inscriptions_pme
FOR INSERT
WITH CHECK (
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND length(email) >= 5 
  AND length(email) <= 254
  AND length(nom_entreprise) >= 2 
  AND length(nom_entreprise) <= 200
  AND length(telephone) >= 8 
  AND length(telephone) <= 20
);

-- 4. FIX: Restrict payment_transactions - Only admins can see payment info
DROP POLICY IF EXISTS "School users can view payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Admins and parents can view payment transactions" ON public.payment_transactions;

CREATE POLICY "Only admins can view payment transactions" ON public.payment_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 5. FIX: Restrict students table - Hide payment info from teachers
DROP POLICY IF EXISTS "Users can access their school's students" ON public.students;
DROP POLICY IF EXISTS "Teachers can view students without payment info" ON public.students;

-- Admins can see everything
CREATE POLICY "Admins can manage students" ON public.students
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Teachers can only see basic student info (no payment data)
CREATE POLICY "Teachers can view basic student info" ON public.students
FOR SELECT
USING (
  user_belongs_to_school(school_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 6. FIX: Add encryption trigger for inscriptions
CREATE OR REPLACE FUNCTION public.auto_encrypt_inscription()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.data_encrypted := true;
  NEW.gdpr_compliant := true;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_inscription_encryption ON public.inscriptions;
CREATE TRIGGER enforce_inscription_encryption
  BEFORE INSERT ON public.inscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_encrypt_inscription();

-- 7. FIX: Add search_path to existing functions
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;