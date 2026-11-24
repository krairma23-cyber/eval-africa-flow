DO $$ DECLARE definition text; BEGIN SELECT pg_get_functiondef('public.guard_grade_write()'::regprocedure) INTO definition; IF position('NEW.validated_by:=uid;' IN definition)=0 THEN RAISE EXCEPTION 'Validation assignment not found'; END IF; EXECUTE replace(definition,'NEW.validated_by:=uid;','NEW.validated_by:=teacher;'); END $$;
CREATE FUNCTION public.guard_graded_subject_metadata() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.assessments a JOIN public.assessment_results r ON r.assessment_id=a.id WHERE a.classroom_subject_id=OLD.id) THEN
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Une matière déjà notée ne peut pas être supprimée.' USING ERRCODE='42501'; END IF;
  IF NEW.coefficient IS DISTINCT FROM OLD.coefficient OR NEW.classroom_id IS DISTINCT FROM OLD.classroom_id OR NEW.subject_id IS DISTINCT FROM OLD.subject_id OR NEW.id IS DISTINCT FROM OLD.id THEN RAISE EXCEPTION 'Le coefficient et la matière d’une classe déjà notée sont verrouillés.' USING ERRCODE='42501'; END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END $$;
CREATE TRIGGER protect_graded_subject BEFORE UPDATE OR DELETE ON public.classroom_subjects FOR EACH ROW EXECUTE FUNCTION public.guard_graded_subject_metadata();
REVOKE ALL ON FUNCTION public.guard_graded_subject_metadata() FROM PUBLIC,anon,authenticated;