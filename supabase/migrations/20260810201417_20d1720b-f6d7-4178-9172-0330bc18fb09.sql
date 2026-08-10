CREATE POLICY "Parents view their children payments"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = payment_transactions.student_id
      AND lower(s.parent_email) = lower((SELECT u.email FROM auth.users u WHERE u.id = auth.uid()))
  )
);

GRANT SELECT ON public.payment_transactions TO authenticated;