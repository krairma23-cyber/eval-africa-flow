-- Fix remaining SECURITY DEFINER functions to have explicit search_path
-- This is critical for security to prevent search_path injection attacks

-- Fix check_search_limit
CREATE OR REPLACE FUNCTION public.check_search_limit(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  monthly_limit INTEGER;
BEGIN
  SELECT searches_count, monthly_searches_limit
  INTO current_count, monthly_limit
  FROM public.profiles
  WHERE id = user_uuid;
  
  RETURN COALESCE(current_count, 0) < COALESCE(monthly_limit, 100);
END;
$function$;

-- Fix increment_search_count
CREATE OR REPLACE FUNCTION public.increment_search_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET searches_count = COALESCE(searches_count, 0) + 1,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$function$;

-- Fix update_conversation_timestamp
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- Fix check_registration_rate_limit
CREATE OR REPLACE FUNCTION public.check_registration_rate_limit(
  p_ip inet, 
  p_email text, 
  p_max_attempts integer DEFAULT 5, 
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_attempts INTEGER;
  is_blocked BOOLEAN := FALSE;
BEGIN
  -- Clean old records
  DELETE FROM public.registration_rate_limits 
  WHERE first_attempt < now() - (p_window_minutes * 2 || ' minutes')::INTERVAL;
  
  -- Check current attempts
  SELECT attempt_count, blocked_until > now()
  INTO current_attempts, is_blocked
  FROM public.registration_rate_limits
  WHERE ip_address = p_ip AND email = p_email;
  
  -- If blocked, return false
  IF is_blocked THEN
    RETURN FALSE;
  END IF;
  
  -- If no record, create one
  IF current_attempts IS NULL THEN
    INSERT INTO public.registration_rate_limits (ip_address, email)
    VALUES (p_ip, p_email);
    RETURN TRUE;
  END IF;
  
  -- If within window and at limit, block
  IF current_attempts >= p_max_attempts THEN
    UPDATE public.registration_rate_limits
    SET blocked_until = now() + (p_window_minutes || ' minutes')::INTERVAL
    WHERE ip_address = p_ip AND email = p_email;
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE public.registration_rate_limits
  SET 
    attempt_count = attempt_count + 1,
    last_attempt = now()
  WHERE ip_address = p_ip AND email = p_email;
  
  RETURN TRUE;
END;
$function$;