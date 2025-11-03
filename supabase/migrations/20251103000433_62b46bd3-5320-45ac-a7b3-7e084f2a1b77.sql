-- Fix security warning: Set search_path for update_user_plan_features_updated_at function
-- Drop trigger first, then function, then recreate both

DROP TRIGGER IF EXISTS update_user_plan_features_timestamp ON public.user_plan_features;
DROP FUNCTION IF EXISTS update_user_plan_features_updated_at();

CREATE OR REPLACE FUNCTION update_user_plan_features_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_user_plan_features_timestamp
  BEFORE UPDATE ON public.user_plan_features
  FOR EACH ROW
  EXECUTE FUNCTION update_user_plan_features_updated_at();