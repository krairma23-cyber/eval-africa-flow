
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['pmes','payments','refund_requests','verification_documents','pme_reviews']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

REVOKE SELECT (join_code) ON public.schools FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_school_join_code(p_school_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin only';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND school_id = p_school_id
  ) THEN
    RAISE EXCEPTION 'Forbidden: not a member of this school';
  END IF;

  SELECT join_code INTO v_code FROM public.schools WHERE id = p_school_id;
  RETURN v_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_school_join_code(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_school_join_code(uuid) TO authenticated;
