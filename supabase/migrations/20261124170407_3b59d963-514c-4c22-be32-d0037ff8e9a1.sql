REVOKE ALL ON public.grade_audit_log FROM anon,authenticated,service_role;
GRANT SELECT ON public.grade_audit_log TO authenticated;
GRANT SELECT,INSERT ON public.grade_audit_log TO service_role;
-- Run as the database owner. Uses real school identities, synthetic assessments,
-- and rolls every fixture/correction back, including audit events.
DO $$
DECLARE source record; other_user uuid; admin_user uuid; teacher_user uuid;
 test_term uuid:=gen_random_uuid(); test_assessment uuid:=gen_random_uuid(); late_assessment uuid:=gen_random_uuid();
 result_row public.assessment_results%ROWTYPE; audit_row public.grade_audit_log%ROWTYPE;
 payload jsonb; before_count bigint; after_count bigint; saved integer;
BEGIN
 SELECT r.student_id,a.classroom_subject_id,a.assessment_type_id,t.academic_year_id,s.school_id,cs.teacher_id
 INTO source FROM public.assessment_results r JOIN public.assessments a ON a.id=r.assessment_id
 JOIN public.terms t ON t.id=a.term_id JOIN public.students s ON s.id=r.student_id
 JOIN public.classroom_subjects cs ON cs.id=a.classroom_subject_id
 JOIN public.enrollments e ON e.student_id=s.id AND e.classroom_id=cs.classroom_id AND e.status='active'
 WHERE EXISTS(SELECT 1 FROM public.profiles p JOIN public.user_roles ur ON ur.user_id=p.user_id WHERE p.school_id=s.school_id AND ur.role='admin') LIMIT 1;
 IF source.student_id IS NULL THEN RAISE EXCEPTION 'Grade-security tests require an enrolled student and school director.'; END IF;
 SELECT p.user_id INTO admin_user FROM public.profiles p JOIN public.user_roles ur ON ur.user_id=p.user_id WHERE p.school_id=source.school_id AND ur.role='admin' LIMIT 1;
 SELECT p.user_id INTO other_user FROM public.profiles p JOIN public.user_roles ur ON ur.user_id=p.user_id WHERE p.school_id<>source.school_id AND ur.role='admin' LIMIT 1;
 IF other_user IS NULL THEN RAISE EXCEPTION 'Grade-security tests require two schools.'; END IF;
 SELECT user_id INTO teacher_user FROM public.teachers WHERE id=source.teacher_id;
 BEGIN
  INSERT INTO public.terms(id,academic_year_id,school_id,name,start_date,end_date) VALUES(test_term,source.academic_year_id,source.school_id,'Security test period',current_date,current_date+30);
  INSERT INTO public.assessments(id,classroom_subject_id,assessment_type_id,term_id,title,assessment_date,max_score,coefficient)
  VALUES(test_assessment,source.classroom_subject_id,source.assessment_type_id,test_term,'Security test assessment',current_date,20,1),
        (late_assessment,source.classroom_subject_id,source.assessment_type_id,test_term,'Security test late entry',current_date,20,1);
  PERFORM set_config('request.jwt.claims',json_build_object('sub',admin_user,'role','authenticated')::text,true);
  PERFORM set_config('request.jwt.claim.sub',admin_user::text,true);
  SET LOCAL ROLE authenticated;
  payload:=jsonb_build_array(jsonb_build_object('student_id',source.student_id,'score',0,'is_absent',false));
  saved:=public.save_assessment_grades(test_assessment,payload);
  IF saved<>1 THEN RAISE EXCEPTION 'Initial save did not write one grade'; END IF;
  SELECT * INTO result_row FROM public.assessment_results WHERE assessment_id=test_assessment;
  IF result_row.locked_at IS NULL OR result_row.score<>0 THEN RAISE EXCEPTION 'Initial grade not locked or zero lost'; END IF;
  SELECT * INTO audit_row FROM public.grade_audit_log WHERE result_id=result_row.id;
  IF audit_row.event_type<>'initial' OR audit_row.actor_id<>admin_user OR audit_row.new_score<>0 OR audit_row.old_score IS NOT NULL THEN RAISE EXCEPTION 'Initial audit invalid'; END IF;
  BEGIN UPDATE public.assessment_results SET score=19 WHERE id=result_row.id; RAISE EXCEPTION 'Direct update allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN DELETE FROM public.assessment_results WHERE id=result_row.id; RAISE EXCEPTION 'Direct deletion allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.grade_audit_log SET reason='tampered' WHERE id=audit_row.id; RAISE EXCEPTION 'Audit mutation allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  payload:=jsonb_build_array(jsonb_build_object('student_id',source.student_id,'result_id',result_row.id,'expected_updated_at',result_row.updated_at,'score',20,'is_absent',false,'reason',' '));
  BEGIN PERFORM public.save_assessment_grades(test_assessment,payload); RAISE EXCEPTION 'Blank reason allowed'; EXCEPTION WHEN raise_exception THEN IF position('obligatoire' IN SQLERRM)=0 THEN RAISE; END IF; END;
  payload:=jsonb_set(payload,'{0,reason}',to_jsonb('Security test justified correction'::text));
  saved:=public.save_assessment_grades(test_assessment,payload);
  SELECT * INTO audit_row FROM public.grade_audit_log WHERE result_id=result_row.id AND event_type='correction';
  IF saved<>1 OR audit_row.old_score<>0 OR audit_row.new_score<>20 OR audit_row.actor_id<>admin_user OR audit_row.reason<>'Security test justified correction' OR NOT ('large_change'=ANY(audit_row.flags)) THEN RAISE EXCEPTION 'Correction audit invalid'; END IF;
  BEGIN PERFORM public.save_assessment_grades(test_assessment,payload); RAISE EXCEPTION 'Stale edit allowed'; EXCEPTION WHEN serialization_failure THEN NULL; END;
  SELECT * INTO result_row FROM public.assessment_results WHERE id=result_row.id;
  payload:=jsonb_build_array(jsonb_build_object('student_id',source.student_id,'result_id',result_row.id,'expected_updated_at',result_row.updated_at,'score',10,'is_absent',false,'reason','Security test second correction'));
  PERFORM public.save_assessment_grades(test_assessment,payload);
  IF NOT EXISTS(SELECT 1 FROM public.grade_audit_log WHERE result_id=result_row.id AND 'repeated_change'=ANY(flags)) THEN RAISE EXCEPTION 'Repeated correction not flagged'; END IF;
  PERFORM public.close_term_grades(test_term);
  IF NOT EXISTS(SELECT 1 FROM public.terms WHERE id=test_term AND grades_closed_at IS NOT NULL AND grades_closed_by=admin_user) THEN RAISE EXCEPTION 'Period not closed'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.grade_audit_log WHERE term_id=test_term AND event_type='period_closed' AND actor_id=admin_user) THEN RAISE EXCEPTION 'Closure not audited'; END IF;
  BEGIN UPDATE public.terms SET grades_closed_at=NULL,grades_closed_by=NULL WHERE id=test_term; RAISE EXCEPTION 'Period reopened'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.save_assessment_grades(late_assessment,jsonb_build_array(jsonb_build_object('student_id',source.student_id,'score',10,'is_absent',false))); RAISE EXCEPTION 'Late first entry allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  SELECT * INTO result_row FROM public.assessment_results WHERE id=result_row.id;
  payload:=jsonb_build_array(jsonb_build_object('student_id',source.student_id,'result_id',result_row.id,'expected_updated_at',result_row.updated_at,'score',11,'is_absent',false,'reason','Security test after closure'));
  PERFORM public.save_assessment_grades(test_assessment,payload);
  IF NOT EXISTS(SELECT 1 FROM public.grade_audit_log WHERE result_id=result_row.id AND 'closed_period'=ANY(flags)) THEN RAISE EXCEPTION 'Closed-period correction not flagged'; END IF;
  BEGIN UPDATE public.assessments SET max_score=40 WHERE id=test_assessment; RAISE EXCEPTION 'Graded scale changed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.classroom_subjects SET coefficient=coalesce(coefficient,1)+1 WHERE id=source.classroom_subject_id; RAISE EXCEPTION 'Graded subject coefficient changed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RESET ROLE;
  SELECT count(*) INTO before_count FROM public.grade_audit_log WHERE term_id=test_term;
  PERFORM set_config('request.jwt.claims',json_build_object('sub',other_user,'role','authenticated')::text,true);
  PERFORM set_config('request.jwt.claim.sub',other_user::text,true);
  SET LOCAL ROLE authenticated;
  IF EXISTS(SELECT 1 FROM public.grade_audit_log WHERE school_id=source.school_id) THEN RAISE EXCEPTION 'Cross-school audit leak'; END IF;
  -- Current version known to the adversary must still be refused.
  RESET ROLE;
  SELECT * INTO result_row FROM public.assessment_results WHERE id=result_row.id;
  SET LOCAL ROLE authenticated;
  payload:=jsonb_build_array(jsonb_build_object('student_id',source.student_id,'result_id',result_row.id,'expected_updated_at',result_row.updated_at,'score',12,'is_absent',false,'reason','Security test cross-school attempt'));
  BEGIN PERFORM public.save_assessment_grades(test_assessment,payload); RAISE EXCEPTION 'Cross-school correction allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM public.close_term_grades(test_term); RAISE EXCEPTION 'Cross-school closure allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  RESET ROLE;
  SELECT count(*) INTO after_count FROM public.grade_audit_log WHERE term_id=test_term;
  IF before_count<>after_count THEN RAISE EXCEPTION 'Rejected correction created an audit entry'; END IF;
  IF teacher_user IS NOT NULL AND NOT public.is_school_admin(source.school_id,teacher_user) THEN
   PERFORM set_config('request.jwt.claims',json_build_object('sub',teacher_user,'role','authenticated')::text,true);
   PERFORM set_config('request.jwt.claim.sub',teacher_user::text,true);
   SET LOCAL ROLE authenticated;
   BEGIN PERFORM public.save_assessment_grades(test_assessment,payload); RAISE EXCEPTION 'Teacher corrected locked grade'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
   IF EXISTS(SELECT 1 FROM public.grade_audit_log WHERE school_id=source.school_id) THEN RAISE EXCEPTION 'Teacher sees director audit'; END IF;
   RESET ROLE;
  END IF;
  RAISE EXCEPTION USING ERRCODE='Z0001',MESSAGE='Rollback successful security test fixtures';
 EXCEPTION WHEN SQLSTATE 'Z0001' THEN RESET ROLE;
 END;
 RAISE NOTICE 'Grade security PASS: locking, required reason, immutable audit, concurrency, closure, flags and cross-school isolation; all test data rolled back.';
END $$;