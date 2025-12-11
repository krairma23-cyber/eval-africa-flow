-- Update the handle_new_user function to assign the requested_role from user metadata
-- This allows users to choose their role (user or teacher) during signup
-- Admin role cannot be self-assigned for security reasons

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  valid_role app_role;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name'
  );
  
  -- Get the requested role from user metadata (defaults to 'user' if not specified)
  requested_role := COALESCE(new.raw_user_meta_data ->> 'requested_role', 'user');
  
  -- Map the requested role to a valid app_role
  -- SECURITY: Admin role cannot be self-assigned
  CASE requested_role
    WHEN 'teacher' THEN valid_role := 'teacher'::app_role;
    ELSE valid_role := 'user'::app_role;  -- Default to user for any other value
  END CASE;
  
  -- Insert the role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, valid_role);
  
  RETURN new;
END;
$$;