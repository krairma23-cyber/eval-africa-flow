-- Fix the monitor_admin_data_access trigger function
-- The issue: casting uuid to TEXT when inserting into a uuid column

CREATE OR REPLACE FUNCTION public.monitor_admin_data_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log admin data access for audit
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO data_access_logs (
      table_name,
      record_id,
      access_type,
      accessed_by,
      justification
    ) VALUES (
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),  -- Remove ::TEXT cast - record_id is uuid type
      TG_OP,
      auth.uid(),
      'Admin data access'
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;