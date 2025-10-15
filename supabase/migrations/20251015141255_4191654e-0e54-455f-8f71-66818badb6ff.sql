-- Add email, postal_code, and phone_2 to schools table
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS phone_2 text;