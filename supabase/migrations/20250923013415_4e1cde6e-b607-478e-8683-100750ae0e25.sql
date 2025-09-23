-- Fix the user role assignment issue
-- First, add roles for existing users without roles
INSERT INTO user_roles (user_id, role)
SELECT p.user_id, 
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) = 1 THEN 'admin'::app_role
    ELSE 'user'::app_role
  END as role
FROM profiles p
WHERE p.user_id NOT IN (SELECT user_id FROM user_roles);

-- Update the handle_new_user function to ensure roles are created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (
    user_id, 
    full_name
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  
  -- Assign role: first user becomes admin, others become users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE 
      WHEN (SELECT COUNT(*) FROM user_roles) = 0 THEN 'admin'::app_role
      ELSE 'user'::app_role
    END
  );
  
  RETURN NEW;
END;
$$;