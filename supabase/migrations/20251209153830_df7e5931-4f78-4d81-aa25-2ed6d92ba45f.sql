-- Drop and recreate the function with correct return type
DROP FUNCTION IF EXISTS public.get_users_for_admin();

CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  role text,
  school_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_school_id uuid;
  is_admin boolean;
BEGIN
  -- Get caller's school_id
  SELECT p.school_id INTO caller_school_id
  FROM profiles p
  WHERE p.user_id = auth.uid();

  -- Check if user has admin role (may have multiple roles)
  SELECT EXISTS(
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ) INTO is_admin;

  -- SERVER-SIDE admin check
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Return only users from same school with their highest priority role
  RETURN QUERY
  SELECT 
    p.user_id,
    au.email::text,
    COALESCE(
      p.full_name,
      CASE 
        WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
        THEN p.first_name || ' ' || p.last_name
        ELSE split_part(au.email::text, '@', 1)
      END
    )::text as full_name,
    COALESCE(
      (SELECT ur.role::text 
       FROM user_roles ur 
       WHERE ur.user_id = p.user_id 
       ORDER BY CASE ur.role::text 
         WHEN 'admin' THEN 1 
         WHEN 'teacher' THEN 2 
         ELSE 3 
       END 
       LIMIT 1),
      'user'
    )::text as role,
    p.school_id,
    p.created_at
  FROM profiles p
  JOIN auth.users au ON au.id = p.user_id
  WHERE p.school_id = caller_school_id
  ORDER BY p.created_at DESC;
END;
$$;