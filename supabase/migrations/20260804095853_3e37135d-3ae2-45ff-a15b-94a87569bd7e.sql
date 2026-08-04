-- 1) Invoices: scope admin access to their own school
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;

CREATE POLICY "School admins can manage their school invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = invoices.user_id
        AND p.school_id IS NOT NULL
        AND public.user_belongs_to_school(p.school_id)
    )
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = invoices.user_id
        AND p.school_id IS NOT NULL
        AND public.user_belongs_to_school(p.school_id)
    )
  )
);

-- 2) Teachers: enforce real column-level restriction for self-updates
CREATE OR REPLACE FUNCTION public.prevent_teacher_sensitive_fields_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- service_role / admins / super admins may change anything
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Self-service teachers: only basic contact info may change
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    RAISE EXCEPTION 'Cannot change school_id';
  END IF;
  IF NEW.teacher_number IS DISTINCT FROM OLD.teacher_number THEN
    RAISE EXCEPTION 'Cannot change teacher_number';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id';
  END IF;
  IF NEW.specialization IS DISTINCT FROM OLD.specialization THEN
    RAISE EXCEPTION 'Only administrators can change specialization';
  END IF;
  IF NEW.hire_date IS DISTINCT FROM OLD.hire_date THEN
    RAISE EXCEPTION 'Only administrators can change hire_date';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Only administrators can change status';
  END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Cannot change created_at';
  END IF;

  RETURN NEW;
END;
$function$;

-- Rename policy so its name matches the enforced scope
DROP POLICY IF EXISTS "Teachers can update own basic info only" ON public.teachers;
CREATE POLICY "Teachers can update own contact info (columns locked by trigger)"
ON public.teachers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());