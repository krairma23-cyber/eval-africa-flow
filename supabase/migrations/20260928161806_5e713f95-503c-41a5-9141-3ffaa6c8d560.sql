-- 1. Block direct join of existing schools at signup (invitation only)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  new_school_name text;
  new_school_id uuid;
  new_campus_id uuid;
  new_program_id uuid;
  v_first text;
  v_last text;
BEGIN
  new_school_name := new.raw_user_meta_data ->> 'school_name';
  v_first := COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 1));
  v_last  := COALESCE(new.raw_user_meta_data ->> 'last_name',  split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 2));

  IF new_school_name IS NOT NULL AND new_school_name <> '' THEN
    INSERT INTO public.schools (name, address, phone, email, join_code)
    VALUES (new_school_name, COALESCE(new.raw_user_meta_data ->> 'school_address', ''),
            COALESCE(new.raw_user_meta_data ->> 'school_phone', ''), new.email,
            UPPER(SUBSTR(MD5(new.id::text || RANDOM()::text), 1, 8)))
    RETURNING id INTO new_school_id;

    INSERT INTO public.campuses (name, school_id, address)
    VALUES ('Campus Principal', new_school_id, COALESCE(new.raw_user_meta_data ->> 'school_address', ''))
    RETURNING id INTO new_campus_id;

    INSERT INTO public.academic_years (name, school_id, start_date, end_date, is_current)
    VALUES (TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YYYY'),
            new_school_id,
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months',
            DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year 6 months', true);

    INSERT INTO public.programs (name, school_id, description)
    VALUES ('Programme Général', new_school_id, 'Programme scolaire par défaut')
    RETURNING id INTO new_program_id;

    INSERT INTO public.grade_levels (name, program_id, level_order) VALUES ('Niveau 1', new_program_id, 1);

    INSERT INTO public.profiles (user_id, first_name, last_name, school_id) VALUES (new.id, v_first, v_last, new_school_id);
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin'::app_role);
    INSERT INTO public.school_memberships (user_id, school_id, role) VALUES (new.id, new_school_id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    -- No school from metadata: joining an existing school is only possible through a teacher invitation.
    INSERT INTO public.profiles (user_id, first_name, last_name, school_id) VALUES (new.id, v_first, v_last, NULL);
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user'::app_role);
  END IF;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name) VALUES (new.id, v_first, COALESCE(v_last, '')) ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'user'::app_role) ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user fallback error: %', SQLERRM;
  END;
  RETURN new;
END;
$function$;

-- 2a. Trigger functions never need to be callable through the API
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.prosecdef AND p.prorettype::regtype::text IN ('trigger','event_trigger')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', r.sig);
  END LOOP;
END $$;

-- 2b. Visitors (not signed in) only keep the helpers used by access rules
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.prosecdef AND p.prorettype::regtype::text NOT IN ('trigger','event_trigger')
             AND p.proname NOT IN ('has_role','is_school_admin','is_super_admin','user_belongs_to_school','user_teaches_student_secure')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', r.sig);
  END LOOP;
END $$;

-- 2c. The app does not use GraphQL; remove the unused endpoint
DROP EXTENSION IF EXISTS pg_graphql;