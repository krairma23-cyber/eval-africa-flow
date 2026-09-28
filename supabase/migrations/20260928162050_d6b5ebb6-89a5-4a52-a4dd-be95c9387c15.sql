DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.prosecdef AND p.prorettype::regtype::text NOT IN ('trigger','event_trigger')
             AND p.proname NOT IN (
               'get_user_school_id','has_role','is_school_admin','is_super_admin','is_teacher','is_user_admin',
               'same_school_admin','user_belongs_to_school','user_teaches_student_secure',
               'export_user_data','get_current_user_roles','get_school_join_code','get_users_for_admin',
               'import_tuition_payments','request_account_deletion','seed_accounting_categories',
               'set_active_school','update_user_role')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;