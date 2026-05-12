
-- 1. payment_transactions: fix join and scope admin to school
DROP POLICY IF EXISTS "Users can view their school's payment transactions" ON public.payment_transactions;
CREATE POLICY "Users can view their school's payment transactions"
ON public.payment_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM students s
    JOIN profiles p ON s.school_id = p.school_id
    WHERE s.id = payment_transactions.student_id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins only view payments" ON public.payment_transactions;
CREATE POLICY "Admins view their school payments"
ON public.payment_transactions
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND EXISTS (
    SELECT 1 FROM students s
    JOIN profiles p ON s.school_id = p.school_id
    WHERE s.id = payment_transactions.student_id
      AND p.user_id = auth.uid()
  )
);

-- 2. conversations & messages: allow PME owners to view their side
CREATE POLICY "PMEs can view their conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pmes
    WHERE pmes.id = conversations.pme_id
      AND pmes.user_id = auth.uid()
  )
);

CREATE POLICY "PMEs can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN pmes ON pmes.id = c.pme_id
    WHERE c.id = messages.conversation_id
      AND pmes.user_id = auth.uid()
  )
);

CREATE POLICY "PMEs can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations c
    JOIN pmes ON pmes.id = c.pme_id
    WHERE c.id = messages.conversation_id
      AND pmes.user_id = auth.uid()
  )
);

-- 3. Avatars bucket: replace unscoped INSERT policies
DROP POLICY IF EXISTS "Authenticated can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Teachers: drop broken/unrestricted update policies; keep one strict
DROP POLICY IF EXISTS "Teachers can update own data" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update own basic info only" ON public.teachers;
DROP POLICY IF EXISTS "teachers_update_own_basic_info" ON public.teachers;

CREATE POLICY "Teachers can update own basic info only"
ON public.teachers
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND school_id = (SELECT t.school_id FROM teachers t WHERE t.id = teachers.id)
  AND teacher_number = (SELECT t.teacher_number FROM teachers t WHERE t.id = teachers.id)
  AND user_id = (SELECT t.user_id FROM teachers t WHERE t.id = teachers.id)
);

-- 5. Inscriptions: explicit admin-only SELECT
CREATE POLICY "Admins can view inscriptions"
ON public.inscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
