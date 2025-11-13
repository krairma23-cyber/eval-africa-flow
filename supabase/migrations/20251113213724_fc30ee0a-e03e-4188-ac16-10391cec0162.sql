-- Fix search_path mutable issue for function (if not already fixed)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Restrict public access to enterprise table
-- Remove the overly permissive policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'enterprise' 
    AND policyname = 'Anyone can view active subscription plans'
  ) THEN
    DROP POLICY "Anyone can view active subscription plans" ON public.enterprise;
  END IF;
END $$;

-- Keep only authenticated access to enterprise data
-- The policy "Authenticated users can view subscription plans" may already exist,
-- so we use DO block to create it only if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'enterprise' 
    AND policyname = 'Authenticated users can view subscription plans'
  ) THEN
    CREATE POLICY "Authenticated users can view subscription plans"
      ON public.enterprise
      FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;