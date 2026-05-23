
-- 1) products: remove public SELECT exposure
DROP POLICY IF EXISTS "Users can view all products" ON public.products;
-- "Users can manage their own products" (ALL using auth.uid()=user_id) already covers owner SELECT.

-- 2) suppliers: restrict writes to admins (shared reference data, no user_id column)
DROP POLICY IF EXISTS "Authenticated users can insert suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can update suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authenticated users can delete suppliers" ON public.suppliers;

CREATE POLICY "Admins can insert suppliers" ON public.suppliers
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update suppliers" ON public.suppliers
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete suppliers" ON public.suppliers
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Fix swapped arguments in user_teaches_student_secure(p_student_id, p_teacher_user_id)
-- assessment_results
DROP POLICY IF EXISTS "Teachers and admins can view assessment results" ON public.assessment_results;
CREATE POLICY "Teachers and admins can view assessment results" ON public.assessment_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessment_results.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Teachers and admins insert assessment results" ON public.assessment_results;
CREATE POLICY "Teachers and admins insert assessment results" ON public.assessment_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessment_results.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Teachers and admins update assessment results" ON public.assessment_results;
CREATE POLICY "Teachers and admins update assessment results" ON public.assessment_results
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessment_results.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = assessment_results.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  );

-- enrollments
DROP POLICY IF EXISTS "Teachers and admins can view enrollments" ON public.enrollments;
CREATE POLICY "Teachers and admins can view enrollments" ON public.enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = enrollments.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  );

-- report_cards
DROP POLICY IF EXISTS "Teachers and admins can view report cards" ON public.report_cards;
CREATE POLICY "Teachers and admins can view report cards" ON public.report_cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = report_cards.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  );

-- student_attendance
DROP POLICY IF EXISTS "Teachers and admins insert student attendance" ON public.student_attendance;
CREATE POLICY "Teachers and admins insert student attendance" ON public.student_attendance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_attendance.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Teachers and admins update student attendance" ON public.student_attendance;
CREATE POLICY "Teachers and admins update student attendance" ON public.student_attendance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_attendance.student_id
        AND public.user_belongs_to_school(s.school_id)
        AND (public.has_role(auth.uid(), 'admin'::public.app_role)
             OR public.user_teaches_student_secure(s.id, auth.uid()))
    )
  );
