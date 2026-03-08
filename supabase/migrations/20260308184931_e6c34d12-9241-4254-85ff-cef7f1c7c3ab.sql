
-- ============================================================
-- FIX 1: Super Admin Privilege Escalation
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role = 'super_admin'
  );
$$;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    user_type IS NOT DISTINCT FROM (SELECT p.user_type FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

-- ============================================================
-- FIX 2: Inscription Rate Limits Public Access
-- ============================================================

DROP POLICY IF EXISTS "Service can manage inscription rate limits" ON public.inscription_rate_limits;

CREATE POLICY "Service can manage inscription rate limits"
ON public.inscription_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- FIX 3: PMEs Sensitive Data Exposure
-- ============================================================

DROP POLICY IF EXISTS "Public can view active PMEs" ON public.pmes;

CREATE POLICY "Authenticated can view active PMEs"
ON public.pmes
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE OR REPLACE VIEW public.pmes_public_view
WITH (security_invoker = true)
AS
SELECT
  id, user_id, business_name, description,
  phone, whatsapp_phone, address, city, commune,
  profile_image_url, cover_image_url, is_active, is_verified,
  average_rating, review_count, total_jobs_completed,
  response_time_minutes, availability_status,
  created_at, updated_at, latitude, longitude
FROM public.pmes
WHERE is_active = true;

-- ============================================================
-- FIX 4: Payment Transactions RLS Bypass
-- ============================================================

DROP POLICY IF EXISTS "System can insert payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "System can update payment transactions" ON public.payment_transactions;

CREATE OR REPLACE FUNCTION public.record_payment_transaction(
  p_student_id UUID,
  p_amount DECIMAL,
  p_reference TEXT,
  p_payment_method TEXT,
  p_payment_date TIMESTAMPTZ,
  p_parent_email TEXT,
  p_parent_name TEXT,
  p_status TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM students WHERE id = p_student_id) THEN
    RAISE EXCEPTION 'Invalid student ID';
  END IF;
  
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF EXISTS (SELECT 1 FROM payment_transactions WHERE payment_reference = p_reference) THEN
    RAISE EXCEPTION 'Duplicate payment reference';
  END IF;
  
  INSERT INTO payment_transactions (
    student_id, amount, payment_reference,
    payment_method, payment_date, parent_email, parent_name,
    status, metadata
  ) VALUES (
    p_student_id, p_amount, p_reference,
    p_payment_method, p_payment_date, p_parent_email, p_parent_name,
    p_status, p_metadata
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

CREATE POLICY "Only service role can manage payment transactions"
ON public.payment_transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
