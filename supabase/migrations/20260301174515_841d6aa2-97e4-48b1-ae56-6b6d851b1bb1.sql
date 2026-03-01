
-- Drop old check constraint and add super_admin
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type = ANY (ARRAY['client'::text, 'pme'::text, 'admin'::text, 'super_admin'::text]));

-- Update user to super_admin
UPDATE public.profiles 
SET user_type = 'super_admin', 
    first_name = 'Jean-Marie', 
    last_name = 'Kra'
WHERE user_id = 'fd79a8f5-2b77-48bb-9638-85583710680b';
