-- Add missing columns to existing user_preferences table
ALTER TABLE public.user_preferences 
  ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS assessment_reminders BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS report_notifications BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS system_updates BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN NOT NULL DEFAULT false;

-- Fix security warning: Set search_path on trigger function
DROP FUNCTION IF EXISTS public.handle_notifications_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
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

-- Recreate the trigger
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notifications_updated_at();