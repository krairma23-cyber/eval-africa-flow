DROP POLICY IF EXISTS "Admins insert report cards" ON public.report_cards;

CREATE POLICY "School staff insert report cards"
ON public.report_cards FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = report_cards.student_id
      AND public.user_belongs_to_school(s.school_id)
      AND (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.user_teaches_student_secure(s.id, auth.uid())
      )
  )
);