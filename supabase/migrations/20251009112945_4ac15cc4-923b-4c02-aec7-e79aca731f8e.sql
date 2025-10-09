-- Add policy for school admins to view all profiles in their school
-- This is the MISSING policy that allows UserManagement page to work
CREATE POLICY "School admins can view school profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.user_id = ur.user_id
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::app_role
        AND p.school_id = profiles.school_id
    )
  );

-- Add policy for school admins to update profiles in their school
CREATE POLICY "School admins can update school profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.user_id = ur.user_id
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::app_role
        AND p.school_id = profiles.school_id
    )
  );

-- Log this critical security fix
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
  'profiles_admin_access',
  '{"issue": "admin_cannot_view_school_profiles", "severity": "HIGH", "impact": "UserManagement_page_broken"}'::jsonb,
  '{"admin_policies_added": 2, "user_management_fixed": true}'::jsonb,
  true
);