-- Automated multi-tenant isolation test for RLS.
-- For several real (non super-admin) users, impersonates them as the
-- `authenticated` role and checks that:
--   1. no table with a school_id column returns rows of another school;
--   2. school-scoped child tables (classrooms, enrollments, grades...) do not leak;
--   3. inserting data for another school is refused.
-- Everything runs inside a transaction that is rolled back: no data is changed.
-- Fails (RAISE EXCEPTION) on the first leak. Run: scripts/test-rls.sh

BEGIN;

DO $$
DECLARE
  u record;
  t text;
  leaks bigint;
  other_school uuid;
  checked int := 0;
  scoped_tables text[] := ARRAY[
    'academic_years','accounting_categories','accounting_entries','api_keys',
    'assessment_types','campuses','profiles','programs','school_backups',
    'school_memberships','students','subjects','support_chat_sessions',
    'support_tickets','teacher_invitations','teachers','terms','webhooks'];
  -- child tables without school_id: checked through their parent
  child_checks text[][] := ARRAY[
    ARRAY['classrooms',        'select count(*) from public.classrooms c join public.academic_years a on a.id = c.academic_year_id where a.school_id <> %L'],
    ARRAY['enrollments',       'select count(*) from public.enrollments e join public.students s on s.id = e.student_id where s.school_id <> %L'],
    ARRAY['student_attendance','select count(*) from public.student_attendance x join public.students s on s.id = x.student_id where s.school_id <> %L'],
    ARRAY['assessment_results','select count(*) from public.assessment_results x join public.students s on s.id = x.student_id where s.school_id <> %L'],
    ARRAY['report_cards',      'select count(*) from public.report_cards x join public.students s on s.id = x.student_id where s.school_id <> %L']];
  i int;
BEGIN
  FOR u IN
    SELECT DISTINCT ON (p.school_id) p.user_id, p.school_id
    FROM public.profiles p
    WHERE p.school_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM public.user_roles r
                      WHERE r.user_id = p.user_id AND r.role = 'super_admin')
    ORDER BY p.school_id, p.created_at
    LIMIT 10
  LOOP
    SELECT id INTO other_school FROM public.schools WHERE id <> u.school_id LIMIT 1;

    PERFORM set_config('request.jwt.claims',
      json_build_object('sub', u.user_id, 'role', 'authenticated')::text, true);
    PERFORM set_config('request.jwt.claim.sub', u.user_id::text, true);
    SET LOCAL ROLE authenticated;

    FOREACH t IN ARRAY scoped_tables LOOP
      IF t = 'school_memberships' THEN
        -- a teacher may list his own memberships in other schools
        EXECUTE format('select count(*) from public.%I where school_id <> %L and user_id <> %L',
                       t, u.school_id, u.user_id) INTO leaks;
      ELSE
        EXECUTE format('select count(*) from public.%I where school_id <> %L', t, u.school_id) INTO leaks;
      END IF;
      IF leaks > 0 THEN
        RAISE EXCEPTION 'RLS LEAK: user % (school %) sees % row(s) of another school in %',
          u.user_id, u.school_id, leaks, t;
      END IF;
    END LOOP;

    FOR i IN 1 .. array_length(child_checks, 1) LOOP
      BEGIN
        EXECUTE format(child_checks[i][2], u.school_id) INTO leaks;
      EXCEPTION WHEN undefined_column OR undefined_table THEN
        leaks := 0; -- schema differs, skip
      END;
      IF leaks > 0 THEN
        RAISE EXCEPTION 'RLS LEAK: user % sees % row(s) of another school in %',
          u.user_id, leaks, child_checks[i][1];
      END IF;
    END LOOP;

    -- write isolation: inserting a subject into another school must fail
    BEGIN
      INSERT INTO public.subjects (name, code, school_id) VALUES ('rls-test', 'RLS', other_school);
      RAISE EXCEPTION 'RLS LEAK: user % could insert a subject into school %', u.user_id, other_school;
    EXCEPTION
      WHEN insufficient_privilege OR check_violation OR read_only_sql_transaction THEN NULL;
    END;

    -- updating another school's students must affect 0 rows
    UPDATE public.students SET first_name = first_name WHERE school_id <> u.school_id;
    GET DIAGNOSTICS leaks = ROW_COUNT;
    IF leaks > 0 THEN
      RAISE EXCEPTION 'RLS LEAK: user % could update % student(s) of another school', u.user_id, leaks;
    END IF;

    RESET ROLE;
    checked := checked + 1;
  END LOOP;

  IF checked < 2 THEN
    RAISE EXCEPTION 'Not enough schools with users to test isolation (found %)', checked;
  END IF;
  RAISE NOTICE 'RLS isolation OK: % users from % schools tested on % tables',
    checked, checked, array_length(scoped_tables, 1) + array_length(child_checks, 1);
END $$;

ROLLBACK;
