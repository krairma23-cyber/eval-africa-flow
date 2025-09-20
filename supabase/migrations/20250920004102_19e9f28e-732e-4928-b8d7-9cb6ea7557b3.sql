-- Fix function security by setting proper search_path for all functions
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT school_id FROM public.profiles WHERE user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_school(school_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND school_id = school_uuid
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_school_admin(p_school_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = p_user_id 
      AND school_id = p_school_id 
      AND role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_teacher(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE user_id = p_user_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.user_teaches_student(p_student_id uuid, p_teacher_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM students s
    JOIN enrollments e ON e.student_id = s.id
    JOIN classroom_subjects cs ON cs.classroom_id = e.classroom_id
    JOIN teachers t ON t.id = cs.teacher_id
    WHERE s.id = p_student_id AND t.user_id = p_teacher_user_id
  );
$function$;