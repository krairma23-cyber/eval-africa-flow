
CREATE POLICY "Super admins can view all schools"
ON public.schools FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all students"
ON public.students FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all teachers"
ON public.teachers FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));
