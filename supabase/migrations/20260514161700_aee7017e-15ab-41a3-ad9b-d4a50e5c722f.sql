-- ============ STUDENTS ============
DROP POLICY IF EXISTS "School staff can access students" ON public.students;

CREATE POLICY "School staff can view students"
ON public.students FOR SELECT TO authenticated
USING (public.user_belongs_to_school(school_id));

-- (Admins INSERT/UPDATE/DELETE policies déjà présentes - conservées)

-- ============ ENROLLMENTS ============
DROP POLICY IF EXISTS "Users can access their school's enrollments" ON public.enrollments;

CREATE POLICY "School staff can view enrollments"
ON public.enrollments FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = enrollments.student_id
    AND public.user_belongs_to_school(s.school_id)
));

CREATE POLICY "Admins manage enrollments"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = enrollments.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
));

CREATE POLICY "Admins update enrollments"
ON public.enrollments FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = enrollments.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = enrollments.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
));

CREATE POLICY "Admins delete enrollments"
ON public.enrollments FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = enrollments.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
));

-- ============ ASSESSMENT_RESULTS ============
DROP POLICY IF EXISTS "Users can access their school's assessment results" ON public.assessment_results;

CREATE POLICY "School staff can view assessment results"
ON public.assessment_results FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = assessment_results.student_id
    AND public.user_belongs_to_school(s.school_id)
));

CREATE POLICY "Teachers and admins insert assessment results"
ON public.assessment_results FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = assessment_results.student_id
    AND public.user_belongs_to_school(s.school_id)
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_teacher(auth.uid()))
));

CREATE POLICY "Teachers and admins update assessment results"
ON public.assessment_results FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = assessment_results.student_id
    AND public.user_belongs_to_school(s.school_id)
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_teacher(auth.uid()))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = assessment_results.student_id
    AND public.user_belongs_to_school(s.school_id)
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_teacher(auth.uid()))
));

CREATE POLICY "Admins delete assessment results"
ON public.assessment_results FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = assessment_results.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
));

-- ============ REPORT_CARDS ============
DROP POLICY IF EXISTS "Users can access their school's report cards" ON public.report_cards;

CREATE POLICY "School staff can view report cards"
ON public.report_cards FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = report_cards.student_id
    AND public.user_belongs_to_school(s.school_id)
));

CREATE POLICY "Admins insert report cards"
ON public.report_cards FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = report_cards.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
));

CREATE POLICY "Admins update report cards"
ON public.report_cards FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = report_cards.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = report_cards.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
));

CREATE POLICY "Admins delete report cards"
ON public.report_cards FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.students s
  WHERE s.id = report_cards.student_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
    AND public.user_belongs_to_school(s.school_id)
));