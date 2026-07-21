
-- Fix teachers self-referencing check bypass
CREATE OR REPLACE FUNCTION public.prevent_teacher_sensitive_fields_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role and admins to change anything
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    RAISE EXCEPTION 'Cannot change school_id';
  END IF;
  IF NEW.teacher_number IS DISTINCT FROM OLD.teacher_number THEN
    RAISE EXCEPTION 'Cannot change teacher_number';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_teacher_sensitive_fields_change ON public.teachers;
CREATE TRIGGER trg_prevent_teacher_sensitive_fields_change
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION public.prevent_teacher_sensitive_fields_change();

-- Fix user_subscriptions self-referencing check bypass
CREATE OR REPLACE FUNCTION public.prevent_subscription_upgrade_bypass()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (edge functions like activate-subscription) to change anything
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.plan_id IS DISTINCT FROM OLD.plan_id THEN
    RAISE EXCEPTION 'Cannot change plan_id directly; use payment flow';
  END IF;
  IF NEW.current_period_start IS DISTINCT FROM OLD.current_period_start THEN
    RAISE EXCEPTION 'Cannot change current_period_start';
  END IF;
  IF NEW.current_period_end IS DISTINCT FROM OLD.current_period_end THEN
    RAISE EXCEPTION 'Cannot change current_period_end';
  END IF;
  -- Users may only set status to 'canceled', never anything else
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'canceled' THEN
    RAISE EXCEPTION 'Users can only cancel their subscription';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_subscription_upgrade_bypass ON public.user_subscriptions;
CREATE TRIGGER trg_prevent_subscription_upgrade_bypass
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.prevent_subscription_upgrade_bypass();
