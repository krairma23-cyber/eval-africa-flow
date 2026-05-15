
-- 1) assessment_results: restrict teacher INSERT/UPDATE to students they teach
DROP POLICY IF EXISTS "Teachers and admins insert assessment results" ON public.assessment_results;
DROP POLICY IF EXISTS "Teachers and admins update assessment results" ON public.assessment_results;

CREATE POLICY "Teachers and admins insert assessment results"
ON public.assessment_results
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = assessment_results.student_id
      AND public.user_belongs_to_school(s.school_id)
      AND (
        public.has_role(auth.uid(), 'admin'::app_role)
        OR public.user_teaches_student_secure(auth.uid(), s.id)
      )
  )
);

CREATE POLICY "Teachers and admins update assessment results"
ON public.assessment_results
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = assessment_results.student_id
      AND public.user_belongs_to_school(s.school_id)
      AND (
        public.has_role(auth.uid(), 'admin'::app_role)
        OR public.user_teaches_student_secure(auth.uid(), s.id)
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = assessment_results.student_id
      AND public.user_belongs_to_school(s.school_id)
      AND (
        public.has_role(auth.uid(), 'admin'::app_role)
        OR public.user_teaches_student_secure(auth.uid(), s.id)
      )
  )
);

-- 2) teachers: only admins of the school may insert teacher records
DROP POLICY IF EXISTS "Users can insert teachers for their school" ON public.teachers;

CREATE POLICY "Admins can insert teachers for their school"
ON public.teachers
FOR INSERT
WITH CHECK (
  public.user_belongs_to_school(school_id)
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3) webhook_logs: restrict SELECT to admins of the owning school
DROP POLICY IF EXISTS "Users can view their school's webhook logs" ON public.webhook_logs;

CREATE POLICY "Admins can view their school's webhook logs"
ON public.webhook_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.webhooks w
    WHERE w.id = webhook_logs.webhook_id
      AND public.user_belongs_to_school(w.school_id)
      AND public.has_role(auth.uid(), 'admin'::app_role)
  )
);
