
-- 1. api_keys
DROP POLICY IF EXISTS "api_keys_admin_all" ON public.api_keys;

CREATE POLICY "api_keys_admin_same_school"
ON public.api_keys
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND public.user_belongs_to_school(school_id)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  AND public.user_belongs_to_school(school_id)
);

-- 2. student_attendance
DROP POLICY IF EXISTS "School staff can view student attendance" ON public.student_attendance;

CREATE POLICY "Admins and assigned teachers view student attendance"
ON public.student_attendance
FOR SELECT
TO authenticated
USING (
  public.user_teaches_student_secure(student_id, auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_attendance.student_id
      AND public.has_role(auth.uid(), 'admin'::app_role)
      AND public.user_belongs_to_school(s.school_id)
  )
);

-- 3. teacher_attendance
DROP POLICY IF EXISTS "School staff can view teacher attendance" ON public.teacher_attendance;

CREATE POLICY "Admins view teacher attendance"
ON public.teacher_attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_attendance.teacher_id
      AND public.has_role(auth.uid(), 'admin'::app_role)
      AND public.user_belongs_to_school(t.school_id)
  )
);

CREATE POLICY "Teachers view own attendance"
ON public.teacher_attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_attendance.teacher_id
      AND t.user_id = auth.uid()
  )
);
