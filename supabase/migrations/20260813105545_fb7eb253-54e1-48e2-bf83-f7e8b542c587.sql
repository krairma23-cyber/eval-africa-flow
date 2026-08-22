-- 1) Platform-operator log tables: super_admin only
DROP POLICY IF EXISTS "Only admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Super admins can read audit logs" ON public.audit_logs
FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view comprehensive audit logs" ON public.comprehensive_audit_logs;
CREATE POLICY "Super admins can view comprehensive audit logs" ON public.comprehensive_audit_logs
FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view data access logs" ON public.data_access_logs;
CREATE POLICY "Super admins can view data access logs" ON public.data_access_logs
FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage IP access" ON public.ip_access_control;
CREATE POLICY "Super admins can manage IP access" ON public.ip_access_control
FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view payment security logs" ON public.payment_security_logs;
CREATE POLICY "Super admins can view payment security logs" ON public.payment_security_logs
FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view rate limit violations" ON public.rate_limit_violations;
CREATE POLICY "Super admins can view rate limit violations" ON public.rate_limit_violations
FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view registration rate limits" ON public.registration_rate_limits;
CREATE POLICY "Super admins can view registration rate limits" ON public.registration_rate_limits
FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can manage security incidents" ON public.security_incidents;
DROP POLICY IF EXISTS "Only admins can view security incidents" ON public.security_incidents;
CREATE POLICY "Super admins can manage security incidents" ON public.security_incidents
FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view security logs" ON public.security_logs;
CREATE POLICY "Super admins can view security logs" ON public.security_logs
FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- 2) user_sessions: no cross-tenant admin read
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
CREATE POLICY "Super admins can view all sessions" ON public.user_sessions
FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- 3) payment_transactions: use standard school membership helper
DROP POLICY IF EXISTS "Admins view their school payments" ON public.payment_transactions;
CREATE POLICY "Admins view their school payments" ON public.payment_transactions
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = payment_transactions.student_id
      AND s.school_id IS NOT NULL
      AND public.user_belongs_to_school(s.school_id)
      AND public.is_school_admin(s.school_id, auth.uid())
  )
);