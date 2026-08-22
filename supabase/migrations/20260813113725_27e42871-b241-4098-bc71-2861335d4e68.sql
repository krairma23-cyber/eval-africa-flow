
-- beta_feedback
DROP POLICY IF EXISTS "Admins can update feedback status" ON public.beta_feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.beta_feedback;
CREATE POLICY "Super admins can update feedback status" ON public.beta_feedback FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can view all feedback" ON public.beta_feedback FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- reports
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
CREATE POLICY "Super admins can update reports" ON public.reports FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT TO authenticated USING ((auth.uid() = reporter_id) OR public.is_super_admin(auth.uid()));

-- cron_jobs
DROP POLICY IF EXISTS "Only admins can view cron jobs" ON public.cron_jobs;
CREATE POLICY "Only super admins can view cron jobs" ON public.cron_jobs FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- processed_webhook_events
DROP POLICY IF EXISTS "Admins can view webhook events" ON public.processed_webhook_events;
CREATE POLICY "Super admins can view webhook events" ON public.processed_webhook_events FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

-- security_cleanup_jobs
DROP POLICY IF EXISTS "Only admins can view cleanup jobs" ON public.security_cleanup_jobs;
CREATE POLICY "Only super admins can view cleanup jobs" ON public.security_cleanup_jobs FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
