
-- 1. user_subscriptions: prevent self-escalation
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;

CREATE POLICY "Users can cancel their own subscription"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan_id IS NOT DISTINCT FROM (SELECT plan_id FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND status IS NOT DISTINCT FROM (SELECT status FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND current_period_end IS NOT DISTINCT FROM (SELECT current_period_end FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
  AND current_period_start IS NOT DISTINCT FROM (SELECT current_period_start FROM public.user_subscriptions s WHERE s.id = user_subscriptions.id)
);

CREATE POLICY "Service role manages subscriptions"
ON public.user_subscriptions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 2. pmes: remove broad SELECT exposing id_card_number / whatsapp_phone
DROP POLICY IF EXISTS "Authenticated can view active PMEs" ON public.pmes;

CREATE POLICY "Admins can view all PMEs"
ON public.pmes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. schools: restrict UPDATE to admins only
DROP POLICY IF EXISTS "Users can update their own school" ON public.schools;

CREATE POLICY "School admins can update their school"
ON public.schools
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.school_id = schools.id
  )
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.school_id = schools.id
  )
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
