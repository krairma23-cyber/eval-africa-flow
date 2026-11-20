DROP POLICY IF EXISTS "Users can cancel their own subscription" ON public.user_subscriptions;

CREATE OR REPLACE FUNCTION public.cancel_my_subscription()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.user_subscriptions SET status = 'cancelled', updated_at = now() WHERE user_id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.cancel_my_subscription() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.cancel_my_subscription() TO authenticated;

CREATE OR REPLACE FUNCTION public.enforce_student_plan_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_limit integer; v_unlimited boolean; v_count integer;
BEGIN
  IF NEW.school_id IS NULL THEN RETURN NEW; END IF;
  SELECT MAX(f.max_students), COALESCE(BOOL_OR(f.unlimited_students), false)
    INTO v_limit, v_unlimited
  FROM public.profiles p
  JOIN public.user_roles r ON r.user_id = p.user_id AND r.role = 'admin'
  JOIN public.user_plan_features f ON f.user_id = p.user_id
  WHERE p.school_id = NEW.school_id;
  IF v_unlimited THEN RETURN NEW; END IF;
  v_limit := COALESCE(v_limit, 50);
  PERFORM pg_advisory_xact_lock(hashtext('student_limit_' || NEW.school_id::text));
  SELECT count(*) INTO v_count FROM public.students WHERE school_id = NEW.school_id;
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Limite d''élèves du forfait atteinte (%). Passez à un forfait supérieur.', v_limit
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.enforce_student_plan_limit() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS trg_enforce_student_plan_limit ON public.students;
CREATE TRIGGER trg_enforce_student_plan_limit BEFORE INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.enforce_student_plan_limit();