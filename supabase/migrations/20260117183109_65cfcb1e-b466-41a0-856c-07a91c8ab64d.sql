-- Fix: Change view to use security_invoker instead of security_definer
-- This ensures the view respects the RLS policies of the querying user

DROP VIEW IF EXISTS public.students_teacher_view;

CREATE VIEW public.students_teacher_view
WITH (security_invoker = on)
AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.date_of_birth,
  s.gender,
  s.avatar_url,
  s.school_id,
  s.created_at,
  s.updated_at,
  s.allergies,
  s.parent_name,
  s.parent_email,
  s.parent_phone
FROM students s;

GRANT SELECT ON public.students_teacher_view TO authenticated;

COMMENT ON VIEW public.students_teacher_view IS 
'Restricted view of students table for teachers (security_invoker). Excludes sensitive medical details and financial data.';