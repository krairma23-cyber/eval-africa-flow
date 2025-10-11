-- Remove the dangerous RLS policy that allows direct user inserts
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;

-- Create a new policy that blocks ALL direct inserts from users
-- Only the service role (edge functions) can insert subscriptions
CREATE POLICY "Block direct user subscription inserts"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (false);

-- Add comment to explain why this policy exists
COMMENT ON POLICY "Block direct user subscription inserts" ON public.user_subscriptions IS 
'This policy blocks all direct user inserts to prevent subscription bypass attacks. Subscriptions must be activated through the activate-subscription edge function which verifies payment.';
