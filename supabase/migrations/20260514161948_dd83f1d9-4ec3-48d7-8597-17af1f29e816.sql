-- Corriger log_medical_access avec les bonnes colonnes
CREATE OR REPLACE FUNCTION public.log_medical_access(
  _student_id uuid,
  _justification text DEFAULT 'medical_view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.data_access_logs (
    accessed_by, table_name, record_id, access_type, justification, created_at
  )
  VALUES (
    auth.uid(), 'students', _student_id, 'MEDICAL_VIEW', _justification, now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_medical_access(uuid, text) TO authenticated;
DROP FUNCTION IF EXISTS public.log_medical_access(uuid, text[]);

-- ============ EXPORT RGPD (droit portabilité) ============
CREATE OR REPLACE FUNCTION public.export_user_data()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _result jsonb;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_build_object(
    'exported_at', now(),
    'user_id', _uid,
    'profile', (SELECT to_jsonb(p) FROM public.profiles p WHERE p.user_id = _uid),
    'roles', (SELECT jsonb_agg(role) FROM public.user_roles WHERE user_id = _uid),
    'notifications', (SELECT jsonb_agg(to_jsonb(n)) FROM public.notifications n WHERE n.user_id = _uid),
    'audit_logs', (SELECT jsonb_agg(to_jsonb(a)) FROM public.comprehensive_audit_logs a WHERE a.user_id = _uid),
    'access_logs', (SELECT jsonb_agg(to_jsonb(d)) FROM public.data_access_logs d WHERE d.accessed_by = _uid),
    'deletion_requests', (SELECT jsonb_agg(to_jsonb(r)) FROM public.account_deletion_requests r WHERE r.user_id = _uid)
  ) INTO _result;

  -- Trace l'export (preuve de demande)
  INSERT INTO public.comprehensive_audit_logs (user_id, action, resource_type, success)
  VALUES (_uid, 'GDPR_EXPORT', 'user_data', true);

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.export_user_data() TO authenticated;

-- ============ DEMANDE DE SUPPRESSION (droit effacement) ============
CREATE OR REPLACE FUNCTION public.request_account_deletion(_reason text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.account_deletion_requests (user_id, reason)
  VALUES (_uid, _reason)
  ON CONFLICT (user_id, status) DO UPDATE
    SET reason = EXCLUDED.reason, requested_at = now()
  RETURNING id INTO _id;

  INSERT INTO public.comprehensive_audit_logs (user_id, action, resource_type, resource_id, success)
  VALUES (_uid, 'GDPR_DELETION_REQUESTED', 'account', _id, true);

  RETURN _id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_account_deletion(text) TO authenticated;