-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "School members can view students" ON students;
DROP POLICY IF EXISTS "Users can access their school's students" ON students;

-- Create security definer function to check if user is admin for a specific school
CREATE OR REPLACE FUNCTION public.is_school_admin(p_school_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = p_user_id
      AND ur.role = 'admin'::app_role
      AND p.school_id = p_school_id
  );
$$;

-- Create restrictive RLS policies for students table

-- Policy 1: School admins can view all students in their school
CREATE POLICY "School admins can view their school's students"
  ON students FOR SELECT
  USING (is_school_admin(school_id, auth.uid()));

-- Policy 2: Teachers can only view students they teach
CREATE POLICY "Teachers can view students they teach"
  ON students FOR SELECT
  USING (
    is_teacher(auth.uid()) AND
    user_teaches_student(id, auth.uid())
  );

-- Policy 3: School admins can insert students
CREATE POLICY "School admins can insert students"
  ON students FOR INSERT
  WITH CHECK (is_school_admin(school_id, auth.uid()));

-- Policy 4: School admins can update students in their school
CREATE POLICY "School admins can update students"
  ON students FOR UPDATE
  USING (is_school_admin(school_id, auth.uid()));

-- Policy 5: School admins can delete students in their school
CREATE POLICY "School admins can delete students"
  ON students FOR DELETE
  USING (is_school_admin(school_id, auth.uid()));

-- Log this security fix
INSERT INTO public.comprehensive_audit_logs (
  user_id,
  action,
  resource_type,
  request_data,
  response_data,
  success
) VALUES (
  NULL,
  'CRITICAL_SECURITY_FIX',
  'students_rls_policies',
  '{"issue": "overly_permissive_student_access", "severity": "CRITICAL"}'::jsonb,
  '{"policies_updated": true, "role_based_access": true, "data_masking": "via_get_secure_student_data"}'::jsonb,
  true
);