-- Remove the dangerous policy that allowed users to insert their own subscriptions
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;

-- Block ALL client-side inserts - only service role (edge functions) can insert
CREATE POLICY "Only service role can insert subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (false); -- No direct client-side inserts allowed!