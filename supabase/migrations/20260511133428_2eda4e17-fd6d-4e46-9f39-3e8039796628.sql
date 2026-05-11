
-- 1. escrow_payments: remove permissive ALL policy
DROP POLICY IF EXISTS "System can manage escrow payments" ON public.escrow_payments;
CREATE POLICY "Service role manages escrow payments"
  ON public.escrow_payments AS PERMISSIVE FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- 2. payments UPDATE: restrict to service_role
DROP POLICY IF EXISTS "System can update payments" ON public.payments;
CREATE POLICY "Service role can update payments"
  ON public.payments FOR UPDATE
  TO service_role USING (true) WITH CHECK (true);

-- 3. INSERT policies: restrict to service_role
DROP POLICY IF EXISTS "System can create invoices" ON public.invoices;
CREATE POLICY "Service role can create invoices"
  ON public.invoices FOR INSERT
  TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create payment notifications" ON public.payment_notifications;
CREATE POLICY "Service role can create payment notifications"
  ON public.payment_notifications FOR INSERT
  TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can create transactions" ON public.transactions;
CREATE POLICY "Service role can create transactions"
  ON public.transactions FOR INSERT
  TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert actions" ON public.user_actions;
CREATE POLICY "Service role can insert actions"
  ON public.user_actions FOR INSERT
  TO service_role WITH CHECK (true);

-- 4. schools: restrict SELECT to school members; add lookup function for join code
DROP POLICY IF EXISTS "Anyone can lookup school by join_code" ON public.schools;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.schools;

CREATE POLICY "School members can view their school"
  ON public.schools FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT school_id FROM public.profiles WHERE user_id = auth.uid())
    OR id IN (SELECT school_id FROM public.teachers WHERE user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.find_school_by_join_code(_code text)
RETURNS TABLE (id uuid, name text, city text, country text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.name, s.city, s.country
  FROM public.schools s
  WHERE s.join_code = _code
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.find_school_by_join_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_school_by_join_code(text) TO authenticated;

-- 5. Storage avatars: enforce folder ownership
DROP POLICY IF EXISTS "Users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars" ON storage.objects;

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 6. Storage verification-documents: make private, remove public approved policy
UPDATE storage.buckets SET public = false WHERE id = 'verification-documents';
DROP POLICY IF EXISTS "Public can view approved verification documents" ON storage.objects;

-- 7. Realtime: restrict channel subscriptions to user-scoped topics by default
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to own topics" ON realtime.messages;
CREATE POLICY "Authenticated users can subscribe to own topics"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE (auth.uid()::text || ':%')
    OR realtime.topic() = ('user:' || auth.uid()::text)
  );
