-- Create secure RPC function for admin user management
CREATE OR REPLACE FUNCTION get_users_for_admin()
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  role text,
  school_id uuid,
  created_at timestamptz
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_school_id uuid;
  caller_role text;
BEGIN
  -- Get caller's school_id and role
  SELECT p.school_id INTO caller_school_id
  FROM profiles p
  WHERE p.user_id = auth.uid();

  SELECT ur.role INTO caller_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid();

  -- SERVER-SIDE admin check
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Return only users from same school
  RETURN QUERY
  SELECT 
    p.user_id,
    au.email,
    COALESCE(
      p.full_name,
      CASE 
        WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
        THEN p.first_name || ' ' || p.last_name
        ELSE split_part(au.email, '@', 1)
      END
    ) as full_name,
    COALESCE(ur.role::text, 'user') as role,
    p.school_id,
    p.created_at
  FROM profiles p
  JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN user_roles ur ON ur.user_id = p.user_id
  WHERE p.school_id = caller_school_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;