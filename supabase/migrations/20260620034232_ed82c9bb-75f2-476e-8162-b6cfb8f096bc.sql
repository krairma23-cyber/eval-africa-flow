
REVOKE ALL ON public.pmes FROM anon;
REVOKE ALL ON public.schools FROM anon;
REVOKE SELECT (join_code) ON public.schools FROM authenticated;

DROP FUNCTION IF EXISTS public.get_school_join_code(uuid);

CREATE FUNCTION public.get_school_join_code(_school_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role)
     AND NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;

  IF NOT public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND school_id = _school_id
    ) THEN
      RAISE EXCEPTION 'Forbidden: school mismatch';
    END IF;
  END IF;

  SELECT join_code INTO v_code FROM public.schools WHERE id = _school_id;
  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.get_school_join_code(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_school_join_code(uuid) TO authenticated;
