
-- F1: Harden profiles INSERT — prevent self-assigning school_id/user_type at signup
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND school_id IS NULL
  AND (user_type IS NULL OR user_type = 'pending')
);

-- F1: RPC to join a school via join_code (assigns school_id + default user_type)
CREATE OR REPLACE FUNCTION public.join_school_with_code(_join_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _school_id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO _school_id
  FROM public.schools
  WHERE join_code = _join_code
  LIMIT 1;

  IF _school_id IS NULL THEN
    RAISE EXCEPTION 'Invalid join code';
  END IF;

  -- Block if user already belongs to a school
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _uid AND school_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'User already belongs to a school';
  END IF;

  UPDATE public.profiles
  SET school_id = _school_id,
      user_type = COALESCE(user_type, 'teacher'),
      updated_at = now()
  WHERE user_id = _uid;

  -- Default role: 'user' (not admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _school_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_school_with_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_school_with_code(text) TO authenticated;

-- F2: RPC to fetch current user's roles (avoid scattered client-side reads)
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_current_user_roles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_user_roles() TO authenticated;
