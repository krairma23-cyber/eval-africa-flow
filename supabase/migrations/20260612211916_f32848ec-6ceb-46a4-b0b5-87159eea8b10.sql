
-- =========================================================================
-- 1) Trigger anti-hijack : empêche de modifier school_id après création
-- =========================================================================
CREATE OR REPLACE FUNCTION public.prevent_school_id_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    -- Seul le service_role (edge functions admin) peut réassigner
    IF current_setting('request.jwt.claim.role', true) <> 'service_role' THEN
      RAISE EXCEPTION 'school_id cannot be modified (multi-tenant integrity)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'students','teachers','classrooms','campuses','subjects',
    'academic_years','terms','assessment_types','api_keys',
    'webhooks','profiles','schedules','classroom_subjects'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name=t AND column_name='school_id'
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_lock_school_id ON public.%I', t);
      EXECUTE format(
        'CREATE TRIGGER trg_lock_school_id BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.prevent_school_id_change()', t
      );
    END IF;
  END LOOP;
END $$;

-- =========================================================================
-- 2) Restreindre les politiques "true" au service_role uniquement
-- =========================================================================
DROP POLICY IF EXISTS "Service role can manage api rate limits" ON public.api_rate_limits;
CREATE POLICY "Service role can manage api rate limits"
  ON public.api_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage auth rate limits" ON public.auth_rate_limits;
CREATE POLICY "Service role can manage auth rate limits"
  ON public.auth_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage contact rate limits" ON public.contact_rate_limits;
CREATE POLICY "Service role can manage contact rate limits"
  ON public.contact_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service can manage inscription rate limits" ON public.inscription_rate_limits;
CREATE POLICY "Service can manage inscription rate limits"
  ON public.inscription_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage registration rate limits" ON public.registration_rate_limits;
CREATE POLICY "Service role can manage registration rate limits"
  ON public.registration_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "System can manage payment security logs" ON public.payment_security_logs;
CREATE POLICY "System can manage payment security logs"
  ON public.payment_security_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Only service role can manage payment transactions" ON public.payment_transactions;
CREATE POLICY "Only service role can manage payment transactions"
  ON public.payment_transactions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update payments" ON public.payments;
CREATE POLICY "Service role can update payments"
  ON public.payments FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Only service role can manage webhook events" ON public.processed_webhook_events;
CREATE POLICY "Only service role can manage webhook events"
  ON public.processed_webhook_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage escrow payments" ON public.escrow_payments;
DROP POLICY IF EXISTS "Service role manages escrow payments" ON public.escrow_payments;
CREATE POLICY "Service role manages escrow payments"
  ON public.escrow_payments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "System can manage cleanup jobs" ON public.security_cleanup_jobs;
CREATE POLICY "System can manage cleanup jobs"
  ON public.security_cleanup_jobs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "System can manage sessions" ON public.user_sessions;
CREATE POLICY "System can manage sessions"
  ON public.user_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role manages subscriptions"
  ON public.user_subscriptions FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can create invoices" ON public.invoices;
CREATE POLICY "Service role can create invoices"
  ON public.invoices FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can create payment notifications" ON public.payment_notifications;
CREATE POLICY "Service role can create payment notifications"
  ON public.payment_notifications FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can log rate limit violations" ON public.rate_limit_violations;
CREATE POLICY "System can log rate limit violations"
  ON public.rate_limit_violations FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert security logs" ON public.security_logs;
CREATE POLICY "System can insert security logs"
  ON public.security_logs FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can create transactions" ON public.transactions;
CREATE POLICY "Service role can create transactions"
  ON public.transactions FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert actions" ON public.user_actions;
CREATE POLICY "Service role can insert actions"
  ON public.user_actions FOR INSERT TO service_role
  WITH CHECK (true);

-- =========================================================================
-- 3) Supprimer la politique permissive legacy sur Evenement
-- =========================================================================
DROP POLICY IF EXISTS "Authenticated users can view events" ON public."Evenement";
CREATE POLICY "Only admins can view events"
  ON public."Evenement" FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- =========================================================================
-- 4) Fonction d'audit multi-tenant (super_admin uniquement)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.audit_multitenant_rls()
RETURNS TABLE(
  table_name text,
  has_rls boolean,
  has_school_id boolean,
  policy_count int,
  has_tenant_scoped_policy boolean,
  risk_level text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: super_admin role required';
  END IF;

  RETURN QUERY
  SELECT
    c.relname::text AS table_name,
    c.relrowsecurity AS has_rls,
    EXISTS (
      SELECT 1 FROM information_schema.columns col
      WHERE col.table_schema='public' AND col.table_name=c.relname AND col.column_name='school_id'
    ) AS has_school_id,
    (SELECT count(*)::int FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) AS policy_count,
    EXISTS (
      SELECT 1 FROM pg_policies p
      WHERE p.schemaname='public' AND p.tablename=c.relname
        AND (p.qual ILIKE '%school_id%' OR p.qual ILIKE '%user_id%'
             OR p.qual ILIKE '%user_belongs_to_school%' OR p.qual ILIKE '%auth.uid()%')
    ) AS has_tenant_scoped_policy,
    CASE
      WHEN NOT c.relrowsecurity THEN 'CRITICAL: RLS disabled'
      WHEN (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) = 0 THEN 'CRITICAL: no policy'
      WHEN NOT EXISTS (
        SELECT 1 FROM pg_policies p
        WHERE p.schemaname='public' AND p.tablename=c.relname
          AND (p.qual ILIKE '%school_id%' OR p.qual ILIKE '%user_id%'
               OR p.qual ILIKE '%user_belongs_to_school%' OR p.qual ILIKE '%auth.uid()%')
      ) THEN 'WARN: no tenant scope'
      ELSE 'OK'
    END AS risk_level
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname='public' AND c.relkind='r'
  ORDER BY
    CASE
      WHEN NOT c.relrowsecurity THEN 0
      WHEN (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname) = 0 THEN 1
      ELSE 2
    END,
    c.relname;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_multitenant_rls() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.audit_multitenant_rls() TO authenticated;
