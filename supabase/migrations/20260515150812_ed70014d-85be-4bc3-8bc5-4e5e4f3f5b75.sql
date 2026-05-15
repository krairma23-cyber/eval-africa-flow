
-- =========================
-- assessment_results
-- =========================
DROP POLICY IF EXISTS "School staff can view assessment results" ON public.assessment_results;

CREATE POLICY "Teachers and admins can view assessment results"
ON public.assessment_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = assessment_results.student_id
      AND user_belongs_to_school(s.school_id)
      AND (
        has_role(auth.uid(), 'admin'::app_role)
        OR user_teaches_student_secure(auth.uid(), s.id)
      )
  )
);

-- Parents can view their child's assessment results
CREATE POLICY "Parents can view their child assessment results"
ON public.assessment_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = assessment_results.student_id
      AND s.parent_email IS NOT NULL
      AND lower(s.parent_email) = lower((auth.jwt() ->> 'email'))
  )
);

-- =========================
-- report_cards
-- =========================
DROP POLICY IF EXISTS "School staff can view report cards" ON public.report_cards;

CREATE POLICY "Teachers and admins can view report cards"
ON public.report_cards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = report_cards.student_id
      AND user_belongs_to_school(s.school_id)
      AND (
        has_role(auth.uid(), 'admin'::app_role)
        OR user_teaches_student_secure(auth.uid(), s.id)
      )
  )
);

CREATE POLICY "Parents can view their child report cards"
ON public.report_cards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = report_cards.student_id
      AND s.parent_email IS NOT NULL
      AND lower(s.parent_email) = lower((auth.jwt() ->> 'email'))
  )
);

-- =========================
-- enrollments
-- =========================
DROP POLICY IF EXISTS "School staff can view enrollments" ON public.enrollments;

CREATE POLICY "Teachers and admins can view enrollments"
ON public.enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = enrollments.student_id
      AND user_belongs_to_school(s.school_id)
      AND (
        has_role(auth.uid(), 'admin'::app_role)
        OR user_teaches_student_secure(auth.uid(), s.id)
      )
  )
);

CREATE POLICY "Parents can view their child enrollments"
ON public.enrollments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = enrollments.student_id
      AND s.parent_email IS NOT NULL
      AND lower(s.parent_email) = lower((auth.jwt() ->> 'email'))
  )
);

-- =========================
-- student_attendance
-- =========================
DROP POLICY IF EXISTS "Users can access their school's student attendance" ON public.student_attendance;

CREATE POLICY "School staff can view student attendance"
ON public.student_attendance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_attendance.student_id
      AND user_belongs_to_school(s.school_id)
  )
);

CREATE POLICY "Teachers and admins insert student attendance"
ON public.student_attendance
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_attendance.student_id
      AND user_belongs_to_school(s.school_id)
      AND (
        has_role(auth.uid(), 'admin'::app_role)
        OR user_teaches_student_secure(auth.uid(), s.id)
      )
  )
);

CREATE POLICY "Teachers and admins update student attendance"
ON public.student_attendance
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_attendance.student_id
      AND user_belongs_to_school(s.school_id)
      AND (
        has_role(auth.uid(), 'admin'::app_role)
        OR user_teaches_student_secure(auth.uid(), s.id)
      )
  )
);

CREATE POLICY "Admins delete student attendance"
ON public.student_attendance
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_attendance.student_id
      AND user_belongs_to_school(s.school_id)
      AND has_role(auth.uid(), 'admin'::app_role)
  )
);

-- =========================
-- teacher_attendance
-- =========================
DROP POLICY IF EXISTS "Users can access their school's teacher attendance" ON public.teacher_attendance;

CREATE POLICY "School staff can view teacher attendance"
ON public.teacher_attendance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_attendance.teacher_id
      AND user_belongs_to_school(t.school_id)
  )
);

CREATE POLICY "Admins manage teacher attendance insert"
ON public.teacher_attendance
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_attendance.teacher_id
      AND user_belongs_to_school(t.school_id)
      AND has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admins manage teacher attendance update"
ON public.teacher_attendance
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_attendance.teacher_id
      AND user_belongs_to_school(t.school_id)
      AND has_role(auth.uid(), 'admin'::app_role)
  )
);

CREATE POLICY "Admins manage teacher attendance delete"
ON public.teacher_attendance
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_attendance.teacher_id
      AND user_belongs_to_school(t.school_id)
      AND has_role(auth.uid(), 'admin'::app_role)
  )
);

-- =========================
-- user_roles : scope by school + block super_admin escalation
-- =========================
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins manage user roles in their school"
ON public.user_roles
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND EXISTS (
    SELECT 1
    FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
);

CREATE POLICY "Admins update user roles in their school"
ON public.user_roles
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND EXISTS (
    SELECT 1
    FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND EXISTS (
    SELECT 1
    FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
);

CREATE POLICY "Admins delete user roles in their school"
ON public.user_roles
FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND role <> 'super_admin'::app_role
  AND EXISTS (
    SELECT 1
    FROM public.profiles p_admin
    JOIN public.profiles p_target ON p_target.user_id = user_roles.user_id
    WHERE p_admin.user_id = auth.uid()
      AND p_admin.school_id IS NOT NULL
      AND p_admin.school_id = p_target.school_id
  )
);
