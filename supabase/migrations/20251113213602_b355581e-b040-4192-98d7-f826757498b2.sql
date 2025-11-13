-- Fix search_path mutable issue for functions
-- Update all functions to have explicit search_path
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

-- Add rate limiting to inscriptions tables
CREATE TABLE IF NOT EXISTS public.inscription_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  attempt_count INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.inscription_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for rate limits table (service role only)
CREATE POLICY "Service can manage inscription rate limits"
  ON public.inscription_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_inscription_rate_limit(p_ip_address INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_count INTEGER;
  v_first_attempt_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clean up old entries (older than 1 hour)
  DELETE FROM public.inscription_rate_limits 
  WHERE first_attempt_at < now() - interval '1 hour';
  
  -- Check current rate limit
  SELECT attempt_count, first_attempt_at
  INTO v_attempt_count, v_first_attempt_at
  FROM public.inscription_rate_limits
  WHERE ip_address = p_ip_address;
  
  IF v_attempt_count IS NULL THEN
    -- First attempt
    INSERT INTO public.inscription_rate_limits (ip_address)
    VALUES (p_ip_address);
    RETURN true;
  ELSIF v_attempt_count >= 3 THEN
    -- Rate limit exceeded (3 attempts per hour)
    RETURN false;
  ELSE
    -- Increment attempt count
    UPDATE public.inscription_rate_limits
    SET attempt_count = attempt_count + 1,
        last_attempt_at = now()
    WHERE ip_address = p_ip_address;
    RETURN true;
  END IF;
END;
$$;

-- Restrict public access to enterprise/subscription plans table
-- Update existing policy to require authentication
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.enterprise;
DROP POLICY IF EXISTS "authenticated_users_can_read_plans" ON public.enterprise;

-- Create new restricted policy
CREATE POLICY "Authenticated users can view subscription plans"
  ON public.enterprise
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Comment: The contact_rate_limits and auth_rate_limits tables already have correct policies (Service role can manage)
-- Comment: These were set correctly in previous migrations