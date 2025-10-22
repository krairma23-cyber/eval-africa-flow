-- Fix search_path for the last remaining function without it
ALTER FUNCTION public.update_pme_verification_status() SET search_path = public;