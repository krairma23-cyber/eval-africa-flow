
DROP POLICY IF EXISTS "Users can view their school's payment transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can view their school's webhooks" ON public.webhooks;
DROP POLICY IF EXISTS "Users can view their school's API keys" ON public.api_keys;
DROP POLICY IF EXISTS "School staff can view students" ON public.students;

CREATE POLICY "Parents can view their own children"
ON public.students
FOR SELECT
TO authenticated
USING (
  parent_email IS NOT NULL
  AND lower(parent_email) = lower((auth.jwt() ->> 'email'))
);
