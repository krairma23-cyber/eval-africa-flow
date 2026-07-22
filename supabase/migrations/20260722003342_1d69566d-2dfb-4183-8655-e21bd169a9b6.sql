
-- Fix profiles self-referential update policy via trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
    RAISE EXCEPTION 'Not allowed to change user_type';
  END IF;
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    RAISE EXCEPTION 'Not allowed to change school_id';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to change user_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Fix teachers self-referential update policy via trigger
CREATE OR REPLACE FUNCTION public.prevent_teacher_privilege_escalation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    RAISE EXCEPTION 'Not allowed to change school_id';
  END IF;
  IF NEW.teacher_number IS DISTINCT FROM OLD.teacher_number THEN
    RAISE EXCEPTION 'Not allowed to change teacher_number';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to change user_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_teacher_privilege_escalation ON public.teachers;
CREATE TRIGGER trg_prevent_teacher_privilege_escalation
BEFORE UPDATE ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.prevent_teacher_privilege_escalation();

DROP POLICY IF EXISTS "Teachers can update own basic info only" ON public.teachers;
CREATE POLICY "Teachers can update own basic info only" ON public.teachers
FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Fix user_subscriptions cancel self-referential policy via trigger
CREATE OR REPLACE FUNCTION public.enforce_subscription_cancel_only()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Allow service_role full access
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  -- Only allow status changes to 'canceled'; block other field mutations by non-service users
  IF NEW.plan_id IS DISTINCT FROM OLD.plan_id
     OR NEW.current_period_start IS DISTINCT FROM OLD.current_period_start
     OR NEW.current_period_end IS DISTINCT FROM OLD.current_period_end
     OR NEW.billing_period IS DISTINCT FROM OLD.billing_period
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Only status can be modified when cancelling subscription';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'canceled' THEN
    RAISE EXCEPTION 'Users may only cancel their subscription';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_subscription_cancel_only ON public.user_subscriptions;
CREATE TRIGGER trg_enforce_subscription_cancel_only
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.enforce_subscription_cancel_only();

DROP POLICY IF EXISTS "Users can cancel their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can cancel their own subscription" ON public.user_subscriptions
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
