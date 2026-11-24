ALTER TABLE public.assessment_results ADD COLUMN locked_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.terms ADD COLUMN grades_closed_at timestamptz, ADD COLUMN grades_closed_by uuid;
UPDATE public.terms SET grades_closed_at=now() WHERE end_date < (now() AT TIME ZONE 'UTC')::date;
CREATE UNIQUE INDEX IF NOT EXISTS assessment_results_one_per_student ON public.assessment_results(assessment_id,student_id);

CREATE TABLE public.grade_audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), school_id uuid NOT NULL,
 result_id uuid, assessment_id uuid, student_id uuid, term_id uuid NOT NULL,
 event_type text NOT NULL, student_name text, assessment_title text, term_name text NOT NULL,
 old_score numeric, new_score numeric, old_absent boolean, new_absent boolean,
 old_comment text, new_comment text, max_score numeric,
 actor_id uuid, actor_name text NOT NULL, reason text NOT NULL,
 flags text[] NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.grade_audit_log TO authenticated;
GRANT SELECT, INSERT ON public.grade_audit_log TO service_role;
ALTER TABLE public.grade_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School direction reads grade audit" ON public.grade_audit_log FOR SELECT TO authenticated USING (school_id=public.get_user_school_id() AND public.is_school_admin(school_id));
CREATE INDEX grade_audit_school_date ON public.grade_audit_log(school_id,created_at DESC,id);
CREATE INDEX grade_audit_result_date ON public.grade_audit_log(result_id,created_at DESC);

CREATE OR REPLACE FUNCTION public.reject_grade_audit_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN RAISE EXCEPTION 'Le journal des notes est immuable.' USING ERRCODE='42501'; END $$;
CREATE TRIGGER grade_audit_immutable BEFORE UPDATE OR DELETE ON public.grade_audit_log FOR EACH ROW EXECUTE FUNCTION public.reject_grade_audit_mutation();

INSERT INTO public.grade_audit_log(school_id,result_id,assessment_id,student_id,term_id,event_type,student_name,assessment_title,term_name,new_score,new_absent,new_comment,max_score,actor_name,reason)
SELECT s.school_id,r.id,a.id,s.id,t.id,'baseline',concat_ws(' ',s.first_name,s.last_name),a.title,t.name,r.score,coalesce(r.is_absent,false),r.comment,a.max_score,'Migration de sécurité','Note préexistante verrouillée ; historique antérieur indisponible.'
FROM public.assessment_results r JOIN public.students s ON s.id=r.student_id JOIN public.assessments a ON a.id=r.assessment_id JOIN public.terms t ON t.id=a.term_id;

CREATE OR REPLACE FUNCTION public.guard_grade_write() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a record; uid uuid:=auth.uid(); school uuid; teacher uuid; admin boolean; reason text; actor text; flags text[]:='{}';
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Une note verrouillée ne peut pas être supprimée ; utilisez une correction motivée.' USING ERRCODE='42501'; END IF;
 SELECT x.*,t.school_id,t.end_date,t.grades_closed_at,t.name AS term_name,cs.classroom_id,cs.teacher_id INTO a FROM public.assessments x JOIN public.terms t ON t.id=x.term_id JOIN public.classroom_subjects cs ON cs.id=x.classroom_subject_id WHERE x.id=NEW.assessment_id FOR SHARE OF x,t,cs;
 SELECT school_id INTO school FROM public.students WHERE id=NEW.student_id;
 IF uid IS NULL OR a.id IS NULL OR school IS DISTINCT FROM a.school_id OR school IS DISTINCT FROM public.get_user_school_id() THEN RAISE EXCEPTION 'Accès aux notes refusé.' USING ERRCODE='42501'; END IF;
 admin:=public.is_school_admin(school,uid);
 SELECT id INTO teacher FROM public.teachers WHERE user_id=uid AND school_id=school ORDER BY id LIMIT 1;
 IF TG_OP='INSERT' THEN
   IF NOT admin AND teacher IS DISTINCT FROM a.teacher_id THEN RAISE EXCEPTION 'Seul l’enseignant affecté ou la direction peut saisir cette note.' USING ERRCODE='42501'; END IF;
   IF a.grades_closed_at IS NOT NULL OR a.end_date < (now() AT TIME ZONE 'UTC')::date THEN RAISE EXCEPTION 'Période clôturée : nouvelle saisie interdite.' USING ERRCODE='42501'; END IF;
   IF NOT EXISTS(SELECT 1 FROM public.enrollments e WHERE e.student_id=NEW.student_id AND e.classroom_id=a.classroom_id AND e.status='active') THEN RAISE EXCEPTION 'Élève non inscrit dans cette classe.' USING ERRCODE='42501'; END IF;
   NEW.locked_at:=clock_timestamp(); NEW.graded_by:=teacher; NEW.graded_at:=clock_timestamp(); NEW.validated_by:=NULL; NEW.validated_at:=NULL;
   reason:='Saisie initiale';
 ELSE
   IF NOT admin OR current_setting('evalscol.grade_correction',true) IS DISTINCT FROM 'authorized' THEN RAISE EXCEPTION 'Note verrouillée : correction réservée à la direction.' USING ERRCODE='42501'; END IF;
   IF NEW.id IS DISTINCT FROM OLD.id OR NEW.student_id IS DISTINCT FROM OLD.student_id OR NEW.assessment_id IS DISTINCT FROM OLD.assessment_id OR NEW.locked_at IS DISTINCT FROM OLD.locked_at OR NEW.graded_by IS DISTINCT FROM OLD.graded_by OR NEW.graded_at IS DISTINCT FROM OLD.graded_at THEN RAISE EXCEPTION 'Identité et verrouillage de la note immuables.' USING ERRCODE='42501'; END IF;
   reason:=btrim(current_setting('evalscol.grade_reason',true));
   IF reason IS NULL OR length(reason)<1 OR length(reason)>2000 THEN RAISE EXCEPTION 'Un motif de correction est obligatoire (2000 caractères maximum).'; END IF;
   NEW.validated_by:=uid; NEW.validated_at:=clock_timestamp();
   IF a.grades_closed_at IS NOT NULL OR a.end_date < (now() AT TIME ZONE 'UTC')::date THEN flags:=array_append(flags,'closed_period'); END IF;
   IF OLD.score IS NOT NULL AND NEW.score IS NOT NULL AND abs(NEW.score-OLD.score)>=a.max_score*0.25 THEN flags:=array_append(flags,'large_change'); END IF;
   IF coalesce(OLD.is_absent,false) IS DISTINCT FROM coalesce(NEW.is_absent,false) THEN flags:=array_append(flags,'absence_change'); END IF;
   IF EXISTS(SELECT 1 FROM public.grade_audit_log WHERE result_id=OLD.id AND event_type='correction' AND created_at>now()-interval '24 hours') THEN flags:=array_append(flags,'repeated_change'); END IF;
 END IF;
 NEW.is_absent:=coalesce(NEW.is_absent,false);
 IF NEW.is_absent THEN NEW.score:=NULL; END IF;
 IF NOT NEW.is_absent AND (NEW.score IS NULL OR NEW.score::text IN ('NaN','Infinity','-Infinity') OR NEW.score<0 OR NEW.score>a.max_score) THEN RAISE EXCEPTION 'La note doit être comprise entre 0 et la note maximale.'; END IF;
 NEW.updated_at:=clock_timestamp();
 SELECT coalesce(nullif(full_name,''),nullif(concat_ws(' ',first_name,last_name),''),'Direction / enseignant') INTO actor FROM public.profiles WHERE user_id=uid;
 INSERT INTO public.grade_audit_log(school_id,result_id,assessment_id,student_id,term_id,event_type,student_name,assessment_title,term_name,old_score,new_score,old_absent,new_absent,old_comment,new_comment,max_score,actor_id,actor_name,reason,flags)
 SELECT school,NEW.id,NEW.assessment_id,NEW.student_id,a.term_id,CASE WHEN TG_OP='INSERT' THEN 'initial' ELSE 'correction' END,concat_ws(' ',s.first_name,s.last_name),a.title,a.term_name,CASE WHEN TG_OP='UPDATE' THEN OLD.score END,NEW.score,CASE WHEN TG_OP='UPDATE' THEN OLD.is_absent END,NEW.is_absent,CASE WHEN TG_OP='UPDATE' THEN OLD.comment END,NEW.comment,a.max_score,uid,coalesce(actor,'Utilisateur'),reason,flags FROM public.students s WHERE s.id=NEW.student_id;
 RETURN NEW;
END $$;
CREATE TRIGGER grades_locked_and_audited BEFORE INSERT OR UPDATE OR DELETE ON public.assessment_results FOR EACH ROW EXECUTE FUNCTION public.guard_grade_write();
REVOKE UPDATE,DELETE ON public.assessment_results FROM authenticated,anon;

CREATE OR REPLACE FUNCTION public.save_assessment_grades(p_assessment_id uuid,p_grades jsonb) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE item jsonb; existing public.assessment_results%ROWTYPE; n integer:=0; student uuid; reason text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Connexion requise.' USING ERRCODE='42501'; END IF;
 IF jsonb_typeof(p_grades) IS DISTINCT FROM 'array' OR jsonb_array_length(p_grades)<1 OR jsonb_array_length(p_grades)>1000 THEN RAISE EXCEPTION 'Lot de notes invalide.'; END IF;
 -- Serialize saves for this assessment to prevent duplicate first entries.
 PERFORM pg_advisory_xact_lock(hashtextextended(p_assessment_id::text,0));
 FOR item IN SELECT value FROM jsonb_array_elements(p_grades) LOOP
  student:=(item->>'student_id')::uuid;
  SELECT * INTO existing FROM public.assessment_results WHERE assessment_id=p_assessment_id AND student_id=student FOR UPDATE;
  IF FOUND THEN
   IF NOT public.is_school_admin(public.get_user_school_id()) THEN RAISE EXCEPTION 'Note verrouillée : correction réservée à la direction.' USING ERRCODE='42501'; END IF;
   IF item->>'result_id' IS DISTINCT FROM existing.id::text OR (item->>'expected_updated_at')::timestamptz IS DISTINCT FROM existing.updated_at THEN RAISE EXCEPTION 'La note a changé depuis son chargement. Rechargez avant de corriger.' USING ERRCODE='40001'; END IF;
   reason:=btrim(item->>'reason');
   IF reason IS NULL OR length(reason)=0 OR length(reason)>2000 THEN RAISE EXCEPTION 'Un motif de correction est obligatoire.'; END IF;
   IF jsonb_typeof(item->'is_absent') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Statut d’absence invalide.'; END IF;
   PERFORM set_config('evalscol.grade_correction','authorized',true); PERFORM set_config('evalscol.grade_reason',reason,true);
   UPDATE public.assessment_results SET score=(item->>'score')::numeric,is_absent=(item->>'is_absent')::boolean,comment=nullif(item->>'comment','') WHERE id=existing.id;
   PERFORM set_config('evalscol.grade_correction','',true); PERFORM set_config('evalscol.grade_reason','',true);
  ELSE
   IF item->>'result_id' IS NOT NULL THEN RAISE EXCEPTION 'Note introuvable ; rechargez la liste.'; END IF;
   IF jsonb_typeof(item->'is_absent') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Statut d’absence invalide.'; END IF;
   INSERT INTO public.assessment_results(assessment_id,student_id,score,is_absent,comment) VALUES(p_assessment_id,student,(item->>'score')::numeric,(item->>'is_absent')::boolean,nullif(item->>'comment',''));
  END IF;
  n:=n+1;
 END LOOP;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.save_assessment_grades(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_assessment_grades(uuid,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_term_grade_closure() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.grades_closed_at IS NOT NULL OR NEW.grades_closed_by IS NOT NULL THEN RAISE EXCEPTION 'Utilisez la clôture sécurisée.'; END IF;
  IF NEW.end_date < (now() AT TIME ZONE 'UTC')::date THEN NEW.grades_closed_at:=clock_timestamp(); END IF;
  RETURN NEW;
 END IF;
 IF OLD.school_id IS DISTINCT FROM NEW.school_id THEN RAISE EXCEPTION 'École de la période immuable.'; END IF;
 IF (OLD.grades_closed_at IS NOT NULL OR OLD.end_date < (now() AT TIME ZONE 'UTC')::date OR EXISTS(SELECT 1 FROM public.assessments a JOIN public.assessment_results r ON r.assessment_id=a.id WHERE a.term_id=OLD.id)) AND (NEW.start_date IS DISTINCT FROM OLD.start_date OR NEW.end_date IS DISTINCT FROM OLD.end_date OR NEW.academic_year_id IS DISTINCT FROM OLD.academic_year_id) THEN RAISE EXCEPTION 'Les dates d’une période clôturée ou déjà notée sont verrouillées.'; END IF;
 IF NEW.grades_closed_at IS DISTINCT FROM OLD.grades_closed_at OR NEW.grades_closed_by IS DISTINCT FROM OLD.grades_closed_by THEN
  IF OLD.grades_closed_at IS NOT NULL OR NOT public.is_school_admin(OLD.school_id) OR OLD.school_id IS DISTINCT FROM public.get_user_school_id() OR current_setting('evalscol.close_grades',true) IS DISTINCT FROM 'authorized' THEN RAISE EXCEPTION 'Clôture réservée à la direction ; réouverture interdite.' USING ERRCODE='42501'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_term_grade_closure BEFORE INSERT OR UPDATE ON public.terms FOR EACH ROW EXECUTE FUNCTION public.guard_term_grade_closure();
CREATE OR REPLACE FUNCTION public.close_term_grades(p_term_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE t public.terms%ROWTYPE; actor text;
BEGIN
 SELECT * INTO t FROM public.terms WHERE id=p_term_id FOR UPDATE;
 IF t.id IS NULL OR auth.uid() IS NULL OR t.school_id IS DISTINCT FROM public.get_user_school_id() OR NOT public.is_school_admin(t.school_id) THEN RAISE EXCEPTION 'Clôture réservée à la direction de l’école.' USING ERRCODE='42501'; END IF;
 IF t.grades_closed_at IS NOT NULL THEN RETURN; END IF;
 PERFORM set_config('evalscol.close_grades','authorized',true);
 UPDATE public.terms SET grades_closed_at=clock_timestamp(),grades_closed_by=auth.uid() WHERE id=t.id;
 PERFORM set_config('evalscol.close_grades','',true);
 SELECT coalesce(nullif(full_name,''),'Direction') INTO actor FROM public.profiles WHERE user_id=auth.uid();
 INSERT INTO public.grade_audit_log(school_id,term_id,event_type,term_name,actor_id,actor_name,reason) VALUES(t.school_id,t.id,'period_closed',t.name,auth.uid(),coalesce(actor,'Direction'),'Clôture définitive de la saisie des notes par la direction.');
END $$;
REVOKE ALL ON FUNCTION public.close_term_grades(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.close_term_grades(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_graded_assessment_metadata() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM public.assessment_results WHERE assessment_id=OLD.id) THEN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Une évaluation notée ne peut pas être supprimée.' USING ERRCODE='42501'; END IF;
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.max_score IS DISTINCT FROM OLD.max_score OR NEW.coefficient IS DISTINCT FROM OLD.coefficient OR NEW.classroom_subject_id IS DISTINCT FROM OLD.classroom_subject_id OR NEW.term_id IS DISTINCT FROM OLD.term_id OR NEW.assessment_type_id IS DISTINCT FROM OLD.assessment_type_id THEN RAISE EXCEPTION 'Les paramètres d’une évaluation notée sont verrouillés.' USING ERRCODE='42501'; END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END $$;
CREATE TRIGGER protect_graded_assessment BEFORE UPDATE OR DELETE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.guard_graded_assessment_metadata();
REVOKE ALL ON FUNCTION public.guard_grade_write(),public.guard_term_grade_closure(),public.guard_graded_assessment_metadata(),public.reject_grade_audit_mutation() FROM PUBLIC,anon,authenticated;