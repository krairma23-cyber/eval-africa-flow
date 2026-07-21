
-- 1. Lock down record_payment_transaction to service_role only
REVOKE ALL ON FUNCTION public.record_payment_transaction(uuid, numeric, text, text, timestamptz, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_payment_transaction(uuid, numeric, text, text, timestamptz, text, text, text, jsonb) TO service_role;

-- 2. Harden update_user_role with school-scope + role escalation checks
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role app_role, justification text DEFAULT 'Role updated by admin'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller_is_admin boolean;
  caller_is_super boolean;
  caller_school uuid;
  target_school uuid;
  old_role app_role;
  result jsonb;
BEGIN
  caller_is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  caller_is_super := public.has_role(auth.uid(), 'super_admin'::app_role);

  IF NOT (caller_is_admin OR caller_is_super) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;

  -- Only super_admin may grant admin/super_admin
  IF new_role IN ('admin'::app_role, 'super_admin'::app_role) AND NOT caller_is_super THEN
    RAISE EXCEPTION 'Only super_admin can grant admin or super_admin roles';
  END IF;

  -- School-scope check for non-super admins
  IF NOT caller_is_super THEN
    SELECT school_id INTO caller_school FROM profiles WHERE user_id = auth.uid();
    SELECT school_id INTO target_school FROM profiles WHERE user_id = target_user_id;
    IF caller_school IS NULL OR target_school IS NULL OR caller_school <> target_school THEN
      RAISE EXCEPTION 'Target user must belong to your school';
    END IF;
  END IF;

  SELECT role INTO old_role FROM user_roles WHERE user_id = target_user_id;

  DELETE FROM user_roles WHERE user_id = target_user_id;
  INSERT INTO user_roles (user_id, role) VALUES (target_user_id, new_role);

  INSERT INTO comprehensive_audit_logs (
    user_id, action, resource_type, resource_id, request_data, response_data, success
  ) VALUES (
    auth.uid(), 'ROLE_CHANGE', 'user_roles', target_user_id,
    jsonb_build_object('target_user_id', target_user_id, 'old_role', old_role, 'new_role', new_role, 'justification', justification),
    jsonb_build_object('success', true), true
  );

  result := jsonb_build_object('success', true, 'old_role', old_role, 'new_role', new_role);
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO comprehensive_audit_logs (
    user_id, action, resource_type, resource_id, request_data, response_data, success
  ) VALUES (
    auth.uid(), 'ROLE_CHANGE_FAILED', 'user_roles', target_user_id,
    jsonb_build_object('target_user_id', target_user_id, 'new_role', new_role, 'justification', justification),
    jsonb_build_object('error', SQLERRM), false
  );
  RAISE;
END;
$function$;

-- 3. Restrict teachers PII: drop broad policy, keep admin + self-view policies already in place
DROP POLICY IF EXISTS "Users must have school_id to view teachers" ON public.teachers;

-- 4. Enterprise plans: only active visible to authenticated users
DROP POLICY IF EXISTS "Authenticated users can view subscription plans" ON public.enterprise;
CREATE POLICY "Authenticated users can view active enterprise plans"
  ON public.enterprise
  FOR SELECT
  TO authenticated
  USING (is_active = true);
