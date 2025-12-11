-- Update handle_new_user function to support automatic admin assignment for school creators
-- When a user creates a new school, they automatically become the admin

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  valid_role app_role;
  new_school_name text;
  new_school_id uuid;
  existing_school_id uuid;
  new_campus_id uuid;
  new_academic_year_id uuid;
  new_program_id uuid;
  new_grade_level_id uuid;
BEGIN
  -- Get metadata from signup
  requested_role := COALESCE(new.raw_user_meta_data ->> 'requested_role', 'user');
  new_school_name := new.raw_user_meta_data ->> 'school_name';
  existing_school_id := (new.raw_user_meta_data ->> 'school_id')::uuid;
  
  -- Check if user is creating a new school
  IF new_school_name IS NOT NULL AND new_school_name != '' THEN
    -- Create the new school
    INSERT INTO public.schools (name, address, phone, email)
    VALUES (
      new_school_name,
      COALESCE(new.raw_user_meta_data ->> 'school_address', ''),
      COALESCE(new.raw_user_meta_data ->> 'school_phone', ''),
      new.email
    )
    RETURNING id INTO new_school_id;
    
    -- Create default campus for the school
    INSERT INTO public.campuses (name, school_id, address)
    VALUES ('Campus Principal', new_school_id, COALESCE(new.raw_user_meta_data ->> 'school_address', ''))
    RETURNING id INTO new_campus_id;
    
    -- Create default academic year
    INSERT INTO public.academic_years (name, school_id, start_date, end_date, is_current)
    VALUES (
      TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YYYY'),
      new_school_id,
      DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months', -- September
      DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year 6 months', -- June next year
      true
    )
    RETURNING id INTO new_academic_year_id;
    
    -- Create default program
    INSERT INTO public.programs (name, school_id, description)
    VALUES ('Programme Général', new_school_id, 'Programme scolaire par défaut')
    RETURNING id INTO new_program_id;
    
    -- Create a default grade level
    INSERT INTO public.grade_levels (name, program_id, level_order)
    VALUES ('Niveau 1', new_program_id, 1)
    RETURNING id INTO new_grade_level_id;
    
    -- Insert into profiles with the new school
    INSERT INTO public.profiles (id, first_name, last_name, school_id)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
      COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
      new_school_id
    );
    
    -- AUTOMATICALLY assign admin role to school creator
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin'::app_role);
    
  ELSE
    -- User is joining an existing school or no school specified
    INSERT INTO public.profiles (id, first_name, last_name, school_id)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
      COALESCE(new.raw_user_meta_data ->> 'last_name', ''),
      existing_school_id
    );
    
    -- Map the requested role to a valid app_role
    -- SECURITY: Admin role cannot be self-assigned when joining
    CASE requested_role
      WHEN 'teacher' THEN valid_role := 'teacher'::app_role;
      ELSE valid_role := 'user'::app_role;
    END CASE;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, valid_role);
  END IF;
  
  RETURN new;
END;
$$;