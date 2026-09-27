-- =====================================================================
-- EvalScol Africa : correctifs de sécurité (v2, audit du 27/09/2026)
-- Ciblé sur l'état RÉEL de la prod (projet xckeensgwzwrweloaeoy) vérifié en lecture seule.
-- À appliquer d'abord sur DEV (yaromrihjuokkmemrpac) puis STAGING, puis PROD.
-- Idempotent : CREATE OR REPLACE / DROP ... IF EXISTS / REVOKE.
-- =====================================================================
BEGIN;

-- ---------------------------------------------------------------------
-- P1 (critique) : fonctions SECURITY DEFINER internes exécutables par anon/authenticated
--   decrypt/encrypt_sensitive_data : oracle de chiffrement/déchiffrement via Vault, sans contrôle
--   apply_standard_rls            : réécrit les politiques RLS de TOUTES les tables (tout "admin")
--   emergency_* / *_search        : PII (vérif. admin globale)
--   create_secure_otp*/session    : crée OTP/session pour n'importe quel user_id
--   cleanup_* / automated_*       : effacement des journaux d'audit par n'importe qui (anti-forensique)
--   process_webhook_event         : pré-réservation de références de paiement (DoS activation)
--   log_security_incident         : injection de faux incidents
--   set_user_role / get_admin_stats / check_rbac_access : contrôle "admin" global (inter-écoles)
-- Aucune n'est appelée par le front (vérifié : src/ n'utilise que has_role, update_user_role,
-- seed_accounting_categories, request_account_deletion, is_school_admin, import_tuition_payments,
-- get_users_for_admin, get_school_join_code, get_current_user_roles, export_user_data).
-- service_role conserve l'accès (edge functions, cron).
-- ---------------------------------------------------------------------
DO $$
DECLARE
  f regprocedure;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure
      FROM pg_proc p
     WHERE p.pronamespace = 'public'::regnamespace
       AND p.proname IN (
         'decrypt_sensitive_data','encrypt_sensitive_data','apply_standard_rls',
         'emergency_full_access','emergency_pii_access','admin_search_customers','secure_admin_search',
         'create_secure_otp','create_secure_otp_v2','create_secure_session','verify_secure_otp',
         'automated_security_cleanup','cleanup_old_security_data','cleanup_security_logs',
         'cleanup_expired_customer_data','cleanup_old_contact_messages','cleanup_old_cron_jobs',
         'cleanup_old_event_registrations','process_webhook_event','log_security_incident',
         'set_user_role','get_admin_stats','check_rbac_access','audit_multitenant_rls',
         'record_payment_transaction'
       )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

-- Pour les futures fonctions créées par postgres : ne plus accorder EXECUTE à anon par défaut
-- (authenticated et service_role gardent leur GRANT explicite par défaut de Supabase)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- ---------------------------------------------------------------------
-- P2 (critique, ex-C6) : handle_new_user accepte un school_id arbitraire depuis les
-- métadonnées d'inscription => n'importe qui rejoint n'importe quelle école (rôle teacher).
-- Correctif : seule la voie join_code est acceptée. Reste de la fonction identique à la prod.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requested_role text;
  valid_role app_role;
  new_school_name text;
  new_school_id uuid;
  existing_school_id uuid;
  join_code_val text;
  new_campus_id uuid;
  new_academic_year_id uuid;
  new_program_id uuid;
  new_grade_level_id uuid;
BEGIN
  requested_role := COALESCE(new.raw_user_meta_data ->> 'requested_role', 'user');
  new_school_name := new.raw_user_meta_data ->> 'school_name';
  join_code_val := new.raw_user_meta_data ->> 'join_code';

  IF join_code_val IS NOT NULL AND join_code_val != '' THEN
    SELECT id INTO existing_school_id
    FROM public.schools
    WHERE join_code = UPPER(TRIM(join_code_val));
  ELSE
    -- SÉCURITÉ : ne jamais faire confiance à un school_id fourni par le client
    existing_school_id := NULL;
  END IF;

  IF new_school_name IS NOT NULL AND new_school_name != '' THEN
    INSERT INTO public.schools (name, address, phone, email, join_code)
    VALUES (
      new_school_name,
      COALESCE(new.raw_user_meta_data ->> 'school_address', ''),
      COALESCE(new.raw_user_meta_data ->> 'school_phone', ''),
      new.email,
      UPPER(SUBSTR(MD5(new.id::text || RANDOM()::text), 1, 8))
    )
    RETURNING id INTO new_school_id;

    INSERT INTO public.campuses (name, school_id, address)
    VALUES ('Campus Principal', new_school_id, COALESCE(new.raw_user_meta_data ->> 'school_address', ''))
    RETURNING id INTO new_campus_id;

    INSERT INTO public.academic_years (name, school_id, start_date, end_date, is_current)
    VALUES (
      TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YYYY'),
      new_school_id,
      DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months',
      DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year 6 months',
      true
    )
    RETURNING id INTO new_academic_year_id;

    INSERT INTO public.programs (name, school_id, description)
    VALUES ('Programme Général', new_school_id, 'Programme scolaire par défaut')
    RETURNING id INTO new_program_id;

    INSERT INTO public.grade_levels (name, program_id, level_order)
    VALUES ('Niveau 1', new_program_id, 1)
    RETURNING id INTO new_grade_level_id;

    INSERT INTO public.profiles (user_id, first_name, last_name, school_id)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', ''), ' ', 1)),
      COALESCE(new.raw_user_meta_data ->> 'last_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', ''), ' ', 2)),
      new_school_id
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin'::app_role);

  ELSE
    INSERT INTO public.profiles (user_id, first_name, last_name, school_id)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 1)),
      COALESCE(new.raw_user_meta_data ->> 'last_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 2)),
      existing_school_id
    );

    -- Le rôle "teacher" n'est accordé que si l'école a été résolue par join_code
    CASE
      WHEN requested_role = 'teacher' AND existing_school_id IS NOT NULL THEN valid_role := 'teacher'::app_role;
      ELSE valid_role := 'user'::app_role;
    END CASE;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, valid_role);
  END IF;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email), ' ', 1)),
      COALESCE(new.raw_user_meta_data ->> 'last_name', '')
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user'::app_role)
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user fallback error: %', SQLERRM;
  END;

  RETURN new;
END;
$function$;

-- ---------------------------------------------------------------------
-- P3 (élevé) : accès inter-écoles via le rôle "admin" GLOBAL
-- (chaque créateur d'école reçoit 'admin' ; has_role(...,'admin') n'est donc PAS un contrôle d'école)
-- ---------------------------------------------------------------------
-- Documents de vérification : lecture réservée au super_admin
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;
CREATE POLICY "Super admins can view all verification documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'verification-documents' AND public.is_super_admin(auth.uid()));

-- FAQ du support : gestion réservée au super_admin
DROP POLICY IF EXISTS "Only admins can insert FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Only admins can update FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Only admins can delete FAQs" ON public.support_faqs;
CREATE POLICY "Only super admins can insert FAQs" ON public.support_faqs
  FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Only super admins can update FAQs" ON public.support_faqs
  FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Only super admins can delete FAQs" ON public.support_faqs
  FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));

-- Sessions de chat support : un admin d'école ne lit plus les conversations des autres écoles
DROP POLICY IF EXISTS "Users can view their own chat sessions"   ON public.support_chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON public.support_chat_sessions;
CREATE POLICY "Users can view their own chat sessions" ON public.support_chat_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));
CREATE POLICY "Users can update their own chat sessions" ON public.support_chat_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- P4 (élevé) : tables de structure en FOR ALL pour TOUT membre de l'école
-- (parent, élève, ou intrus via P2 pouvaient supprimer classes, matières, évaluations...)
-- Lecture : membres de l'école. Écriture : admin de l'école (+ enseignants pour
-- évaluations / emplois du temps / matières de classe). À VALIDER fonctionnellement sur DEV.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_manage_school(p_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_school_admin(p_school_id, auth.uid()) OR public.is_super_admin(auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.can_teach_in_school(p_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.can_manage_school(p_school_id)
      OR (public.has_role(auth.uid(), 'teacher'::app_role) AND public.user_belongs_to_school(p_school_id));
$$;

REVOKE EXECUTE ON FUNCTION public.can_manage_school(uuid)   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_teach_in_school(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.can_manage_school(uuid)   TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.can_teach_in_school(uuid) TO authenticated, service_role;

-- Tables avec school_id direct
DO $$
DECLARE t text; old_pol text;
BEGIN
  FOR t, old_pol IN VALUES
    ('academic_years',   'Users can access their school''s academic years'),
    ('assessment_types', 'Users can access their school''s assessment types'),
    ('campuses',         'Users can access their school''s campuses'),
    ('programs',         'Users can access their school''s programs'),
    ('subjects',         'Users can access their school''s subjects')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', old_pol, t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_member_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_write', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.user_belongs_to_school(school_id))',
                   t || '_member_select', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.can_manage_school(school_id)) WITH CHECK (public.can_manage_school(school_id))',
                   t || '_admin_write', t);
  END LOOP;
END $$;

-- classrooms (via campuses)
DROP POLICY IF EXISTS "Users can access their school's classrooms" ON public.classrooms;
DROP POLICY IF EXISTS classrooms_member_select ON public.classrooms;
DROP POLICY IF EXISTS classrooms_admin_write   ON public.classrooms;
CREATE POLICY classrooms_member_select ON public.classrooms FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.campuses c WHERE c.id = classrooms.campus_id AND public.user_belongs_to_school(c.school_id)));
CREATE POLICY classrooms_admin_write ON public.classrooms FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.campuses c WHERE c.id = classrooms.campus_id AND public.can_manage_school(c.school_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.campuses c WHERE c.id = classrooms.campus_id AND public.can_manage_school(c.school_id)));

-- grade_levels (via programs)
DROP POLICY IF EXISTS "Users can access their school's grade levels" ON public.grade_levels;
DROP POLICY IF EXISTS grade_levels_member_select ON public.grade_levels;
DROP POLICY IF EXISTS grade_levels_admin_write   ON public.grade_levels;
CREATE POLICY grade_levels_member_select ON public.grade_levels FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.programs p WHERE p.id = grade_levels.program_id AND public.user_belongs_to_school(p.school_id)));
CREATE POLICY grade_levels_admin_write ON public.grade_levels FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.programs p WHERE p.id = grade_levels.program_id AND public.can_manage_school(p.school_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.programs p WHERE p.id = grade_levels.program_id AND public.can_manage_school(p.school_id)));

-- classroom_subjects (via classrooms -> campuses) : admin + enseignants
DROP POLICY IF EXISTS "Users can access their school's classroom subjects" ON public.classroom_subjects;
DROP POLICY IF EXISTS classroom_subjects_member_select ON public.classroom_subjects;
DROP POLICY IF EXISTS classroom_subjects_staff_write   ON public.classroom_subjects;
CREATE POLICY classroom_subjects_member_select ON public.classroom_subjects FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classrooms cl JOIN public.campuses c ON c.id = cl.campus_id
                 WHERE cl.id = classroom_subjects.classroom_id AND public.user_belongs_to_school(c.school_id)));
CREATE POLICY classroom_subjects_staff_write ON public.classroom_subjects FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.classrooms cl JOIN public.campuses c ON c.id = cl.campus_id
                      WHERE cl.id = classroom_subjects.classroom_id AND public.can_teach_in_school(c.school_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.classrooms cl JOIN public.campuses c ON c.id = cl.campus_id
                      WHERE cl.id = classroom_subjects.classroom_id AND public.can_teach_in_school(c.school_id)));

-- schedules (via classrooms -> campuses) : admin + enseignants
DROP POLICY IF EXISTS "Users can access their school's schedules" ON public.schedules;
DROP POLICY IF EXISTS schedules_member_select ON public.schedules;
DROP POLICY IF EXISTS schedules_staff_write   ON public.schedules;
CREATE POLICY schedules_member_select ON public.schedules FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classrooms cl JOIN public.campuses c ON c.id = cl.campus_id
                 WHERE cl.id = schedules.classroom_id AND public.user_belongs_to_school(c.school_id)));
CREATE POLICY schedules_staff_write ON public.schedules FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.classrooms cl JOIN public.campuses c ON c.id = cl.campus_id
                      WHERE cl.id = schedules.classroom_id AND public.can_teach_in_school(c.school_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.classrooms cl JOIN public.campuses c ON c.id = cl.campus_id
                      WHERE cl.id = schedules.classroom_id AND public.can_teach_in_school(c.school_id)));

-- assessments (via classroom_subjects -> classrooms -> campuses) : admin + enseignants
DROP POLICY IF EXISTS "Users can access their school's assessments" ON public.assessments;
DROP POLICY IF EXISTS assessments_member_select ON public.assessments;
DROP POLICY IF EXISTS assessments_staff_write   ON public.assessments;
CREATE POLICY assessments_member_select ON public.assessments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.classroom_subjects cs JOIN public.classrooms cl ON cl.id = cs.classroom_id
                 JOIN public.campuses c ON c.id = cl.campus_id
                 WHERE cs.id = assessments.classroom_subject_id AND public.user_belongs_to_school(c.school_id)));
CREATE POLICY assessments_staff_write ON public.assessments FOR ALL TO authenticated
  USING      (EXISTS (SELECT 1 FROM public.classroom_subjects cs JOIN public.classrooms cl ON cl.id = cs.classroom_id
                      JOIN public.campuses c ON c.id = cl.campus_id
                      WHERE cs.id = assessments.classroom_subject_id AND public.can_teach_in_school(c.school_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.classroom_subjects cs JOIN public.classrooms cl ON cl.id = cs.classroom_id
                      JOIN public.campuses c ON c.id = cl.campus_id
                      WHERE cs.id = assessments.classroom_subject_id AND public.can_teach_in_school(c.school_id)));

-- ---------------------------------------------------------------------
-- P5 (fonctionnel) : rejoindre une école par code est cassé
-- trg_lock_school_id refuse tout changement de school_id hors service_role, donc
-- join_school_with_code / join_school_by_code échouent toujours.
-- Correctif : bypass transactionnel (set_config(..., true)) posé UNIQUEMENT par ces fonctions.
-- set_config n'est pas exposé via PostgREST (schéma pg_catalog), le client ne peut pas le poser.
-- NB : ensure_user_has_school attribue une école à chaque profil créé ; les fonctions ci-dessous
-- refusent donc "déjà rattaché". Voir l'audit (P5) pour la décision produit.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_school_id_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
       AND current_setting('app.school_join_bypass', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'school_id cannot be modified (multi-tenant integrity)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR current_setting('app.school_join_bypass', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to change user_id';
  END IF;
  IF NEW.school_id IS DISTINCT FROM OLD.school_id AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not allowed to change school_id';
  END IF;
  -- user_type : modifiable uniquement par un admin de l'école du profil (et non par tout "admin")
  IF NEW.user_type IS DISTINCT FROM OLD.user_type
     AND NOT public.is_school_admin(OLD.school_id, auth.uid())
     AND NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not allowed to change user_type';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_school_with_code(_join_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _school_id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT id INTO _school_id FROM public.schools
   WHERE join_code = UPPER(TRIM(_join_code)) LIMIT 1;
  IF _school_id IS NULL THEN RAISE EXCEPTION 'Invalid join code'; END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _uid AND school_id IS NOT NULL) THEN
    RAISE EXCEPTION 'User already belongs to a school';
  END IF;

  PERFORM set_config('app.school_join_bypass', 'on', true);
  UPDATE public.profiles
     SET school_id = _school_id, user_type = COALESCE(user_type, 'teacher'), updated_at = now()
   WHERE user_id = _uid;
  PERFORM set_config('app.school_join_bypass', 'off', true);

  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN _school_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_school_by_code(p_join_code text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_school_id uuid;
  v_school_name text;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;

  SELECT id, name INTO v_school_id, v_school_name
    FROM public.schools WHERE join_code = UPPER(TRIM(p_join_code));
  IF v_school_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Code école invalide');
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id AND school_id IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Vous êtes déjà rattaché à une école');
  END IF;

  PERFORM set_config('app.school_join_bypass', 'on', true);
  UPDATE public.profiles SET school_id = v_school_id, updated_at = now() WHERE user_id = v_user_id;
  PERFORM set_config('app.school_join_bypass', 'off', true);

  RETURN json_build_object('success', true, 'school_name', v_school_name, 'school_id', v_school_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_school_with_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_school_by_code(text)   FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.join_school_with_code(text) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.join_school_by_code(text)   TO authenticated;

-- ---------------------------------------------------------------------
-- P6 (élevé, ex-H1) : double crédit des frais de scolarité
-- process-tuition-payment met à jour students.amount_paid AVANT d'enregistrer la transaction
-- et ignore l'erreur "Duplicate payment reference" => deux appels concurrents = double crédit.
-- Correctif : RPC atomique (INSERT d'abord, la contrainte UNIQUE bloque le rejeu, puis
-- incrément SQL). À appeler depuis l'edge function (voir l'audit, section P6).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_tuition_payment(
  p_reference text, p_student_id uuid, p_amount numeric,
  p_paid_at timestamptz, p_parent_email text, p_parent_name text, p_metadata jsonb
) RETURNS TABLE(new_total numeric, new_status text, tuition numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- UNIQUE(payment_reference) : tout rejeu échoue ici (23505) avant toute mise à jour
  INSERT INTO public.payment_transactions (student_id, amount, payment_reference, payment_method,
         payment_date, parent_email, parent_name, status, metadata)
  VALUES (p_student_id, p_amount, p_reference, 'mobile_money',
         COALESCE(p_paid_at, now()), COALESCE(p_parent_email, ''), COALESCE(p_parent_name, 'Unknown'),
         'completed', p_metadata);

  RETURN QUERY
  UPDATE public.students s
     SET amount_paid = COALESCE(s.amount_paid, 0) + p_amount,
         payment_status = CASE
           WHEN COALESCE(s.tuition_fee, 0) > 0 AND COALESCE(s.amount_paid, 0) + p_amount >= s.tuition_fee THEN 'paid'
           ELSE 'partial' END,
         updated_at = now()
   WHERE s.id = p_student_id
  RETURNING s.amount_paid, s.payment_status, s.tuition_fee;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid student ID';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_tuition_payment(text,uuid,numeric,timestamptz,text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_tuition_payment(text,uuid,numeric,timestamptz,text,text,jsonb) TO service_role;

COMMIT;

-- =====================================================================
-- VÉRIFICATIONS APRÈS APPLICATION (SQL Editor) :
-- 1) Plus aucune de ces fonctions exécutable par anon :
--   SELECT p.proname FROM pg_proc p WHERE p.pronamespace='public'::regnamespace
--     AND p.prosecdef AND has_function_privilege('anon', p.oid, 'EXECUTE')
--     AND p.proname IN ('decrypt_sensitive_data','apply_standard_rls','create_secure_session',
--                       'process_webhook_event','log_security_incident','cleanup_old_security_data');
--   => 0 ligne attendue
-- 2) Plus de has_role(...,'admin') sans filtre d'école :
--   SELECT schemaname, tablename, policyname FROM pg_policies
--    WHERE coalesce(qual,'')||coalesce(with_check,'') ILIKE '%''admin''::app_role%'
--      AND coalesce(qual,'')||coalesce(with_check,'') !~ 'school';
-- 3) Relancer Advisors > Security dans le dashboard.
-- =====================================================================
