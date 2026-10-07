-- =====================================================================
-- EvalScol Africa : correctifs de sécurité (v3.1, rebasée le 07/10/2026)
-- v3.1 : idempotente avec la migration Lovable 20261003010629 (FAQ + chat support déjà appliqués en prod)
-- Rebasée sur l'état RÉEL de la prod au 01/10/2026, qui inclut déjà les migrations
-- Lovable du 28/09 (invitations enseignants, school_memberships, set_active_school,
-- révocation des fonctions SECURITY DEFINER, handle_new_user sans school_id).
-- => P2 et P5 de la v2 sont RETIRÉS (déjà traités autrement en prod ; les ré-appliquer
--    aurait cassé le nouveau système d'invitations).
-- Testée sur DEV (yaromrihjuokkmemrpac), clone exact du schéma de prod.
-- Idempotent : CREATE OR REPLACE / DROP ... IF EXISTS / REVOKE.
-- =====================================================================

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
-- P10 (CRITIQUE, nouveau) : un enseignant invité devient ADMIN de l'école qui l'invite
-- Chaîne prouvée sur DEV :
--  1. teacher-invite-accept crée le compte -> handle_new_user insère un profil sans école
--  2. le trigger ensure_school_on_profile_insert (ensure_user_has_school) crée alors une
--     école "Prénom Nom" et donne le rôle GLOBAL 'admin'
--  3. attach() bascule profiles.school_id sur l'école invitante
--  => is_school_admin(école_invitante, prof) = true, has_role(prof,'admin') = true :
--     le prof gère élèves, paiements, rôles, comptabilité de l'école qui l'a invité.
--  Même effet pour un admin existant qui accepte une invitation (action "join"),
--  et pour tout admin multi-écoles via set_active_school.
-- Correctif : le rôle 'admin' devient lié à l'école ACTIVE via school_memberships.role='admin'
-- (backfill déjà fait par Lovable : 31/31 admins prod ont leur membership admin).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
     AND (_role <> 'admin'::app_role OR EXISTS (
           SELECT 1 FROM public.profiles p
             JOIN public.school_memberships m ON m.user_id = p.user_id AND m.school_id = p.school_id
            WHERE p.user_id = _user_id AND m.role = 'admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin(p_school_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON p.user_id = ur.user_id
      JOIN public.school_memberships m ON m.user_id = ur.user_id AND m.school_id = p_school_id
     WHERE ur.user_id = p_user_id AND ur.role = 'admin'::app_role
       AND p.school_id = p_school_id AND m.role = 'admin');
$$;

-- Plus de création d'école automatique pour un e-mail qui a une invitation en attente,
-- et enregistrement de la membership admin quand l'école est créée.
CREATE OR REPLACE FUNCTION public.ensure_user_has_school()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_school_id uuid;
  v_email text;
BEGIN
  IF NEW.school_id IS NOT NULL THEN RETURN NEW; END IF;
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = NEW.user_id;
  IF EXISTS (SELECT 1 FROM public.teacher_invitations i
              WHERE lower(i.email) = v_email AND i.status = 'pending' AND i.expires_at > now()) THEN
    RETURN NEW;  -- l'invitation rattachera l'utilisateur, en tant qu'enseignant uniquement
  END IF;
  INSERT INTO public.schools (name, address, academic_year, created_at, updated_at)
  VALUES (COALESCE(NEW.first_name || ' ' || NEW.last_name, 'Mon École'), '', 
          TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YYYY'), now(), now())
  RETURNING id INTO new_school_id;
  NEW.school_id := new_school_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  INSERT INTO public.school_memberships (user_id, school_id, role) VALUES (NEW.user_id, new_school_id, 'admin')
  ON CONFLICT (user_id, school_id) DO UPDATE SET role = 'admin';
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.ensure_user_has_school() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- P3 (élevé) : accès inter-écoles via le rôle "admin" GLOBAL
-- (chaque créateur d'école reçoit 'admin' ; has_role(...,'admin') n'est donc PAS un contrôle d'école)
-- ---------------------------------------------------------------------
-- Documents de vérification : lecture réservée au super_admin
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can view all verification documents" ON storage.objects;
CREATE POLICY "Super admins can view all verification documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'verification-documents' AND public.is_super_admin(auth.uid()));

-- FAQ du support : gestion réservée au super_admin
DROP POLICY IF EXISTS "Only admins can insert FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Only admins can update FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Only admins can delete FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Only super admins can insert FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Only super admins can update FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Only super admins can delete FAQs" ON public.support_faqs;
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


-- terms : même schéma (la politique prod "Users manage their school terms" est FOR ALL pour tout membre)
DROP POLICY IF EXISTS "Users manage their school terms" ON public.terms;
DROP POLICY IF EXISTS terms_member_select ON public.terms;
DROP POLICY IF EXISTS terms_admin_write   ON public.terms;
CREATE POLICY terms_member_select ON public.terms FOR SELECT TO authenticated
  USING (public.user_belongs_to_school(school_id));
CREATE POLICY terms_admin_write ON public.terms FOR ALL TO authenticated
  USING (public.can_manage_school(school_id)) WITH CHECK (public.can_manage_school(school_id));

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

