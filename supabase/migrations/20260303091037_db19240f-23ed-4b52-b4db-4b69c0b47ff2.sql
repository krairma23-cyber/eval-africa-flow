
-- Add join_code column to schools for school joining mechanism
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- Generate join codes for existing schools
UPDATE public.schools 
SET join_code = UPPER(SUBSTR(MD5(id::text || RANDOM()::text), 1, 8))
WHERE join_code IS NULL;

-- Make join_code NOT NULL with a default for new schools
ALTER TABLE public.schools ALTER COLUMN join_code SET DEFAULT UPPER(SUBSTR(MD5(RANDOM()::text), 1, 8));

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_schools_join_code ON public.schools(join_code);

-- Allow anyone authenticated to look up schools by join_code (needed for joining)
CREATE POLICY "Anyone can lookup school by join_code"
ON public.schools
FOR SELECT
TO authenticated
USING (true);

-- Create a function to join a school by code
CREATE OR REPLACE FUNCTION public.join_school_by_code(p_join_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id UUID;
  v_school_name TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Non authentifié');
  END IF;
  
  -- Find school by code
  SELECT id, name INTO v_school_id, v_school_name
  FROM public.schools 
  WHERE join_code = UPPER(TRIM(p_join_code));
  
  IF v_school_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Code école invalide');
  END IF;
  
  -- Check if user already has a school
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_user_id AND school_id IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Vous êtes déjà rattaché à une école');
  END IF;
  
  -- Update the user's profile with the school_id
  UPDATE public.profiles 
  SET school_id = v_school_id 
  WHERE user_id = v_user_id;
  
  RETURN json_build_object('success', true, 'school_name', v_school_name, 'school_id', v_school_id);
END;
$$;

-- Also update handle_new_user to handle join_code from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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
  join_code_val text;
  new_campus_id uuid;
  new_academic_year_id uuid;
  new_program_id uuid;
  new_grade_level_id uuid;
BEGIN
  -- Get metadata from signup
  requested_role := COALESCE(new.raw_user_meta_data ->> 'requested_role', 'user');
  new_school_name := new.raw_user_meta_data ->> 'school_name';
  join_code_val := new.raw_user_meta_data ->> 'join_code';
  
  -- Try to resolve school from join_code
  IF join_code_val IS NOT NULL AND join_code_val != '' THEN
    SELECT id INTO existing_school_id
    FROM public.schools
    WHERE join_code = UPPER(TRIM(join_code_val));
  ELSE
    -- Safely get existing_school_id (may be null for Google OAuth)
    BEGIN
      existing_school_id := (new.raw_user_meta_data ->> 'school_id')::uuid;
    EXCEPTION WHEN OTHERS THEN
      existing_school_id := NULL;
    END;
  END IF;
  
  -- Check if user is creating a new school
  IF new_school_name IS NOT NULL AND new_school_name != '' THEN
    -- Create the new school with join code
    INSERT INTO public.schools (name, address, phone, email, join_code)
    VALUES (
      new_school_name,
      COALESCE(new.raw_user_meta_data ->> 'school_address', ''),
      COALESCE(new.raw_user_meta_data ->> 'school_phone', ''),
      new.email,
      UPPER(SUBSTR(MD5(new.id::text || RANDOM()::text), 1, 8))
    )
    RETURNING id INTO new_school_id;
    
    -- Create default campus
    INSERT INTO public.campuses (name, school_id, address)
    VALUES ('Campus Principal', new_school_id, COALESCE(new.raw_user_meta_data ->> 'school_address', ''))
    RETURNING id INTO new_campus_id;
    
    -- Create default academic year
    INSERT INTO public.academic_years (name, school_id, start_date, end_date, is_current)
    VALUES (
      TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YYYY'),
      new_school_id,
      DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months',
      DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year 6 months',
      true
    )
    RETURNING id INTO new_academic_year_id;
    
    -- Create default program
    INSERT INTO public.programs (name, school_id, description)
    VALUES ('Programme Général', new_school_id, 'Programme scolaire par défaut')
    RETURNING id INTO new_program_id;
    
    -- Create default grade level
    INSERT INTO public.grade_levels (name, program_id, level_order)
    VALUES ('Niveau 1', new_program_id, 1)
    RETURNING id INTO new_grade_level_id;
    
    -- Insert into profiles WITH user_id set correctly
    INSERT INTO public.profiles (user_id, first_name, last_name, school_id)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', ''), ' ', 1)),
      COALESCE(new.raw_user_meta_data ->> 'last_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', ''), ' ', 2)),
      new_school_id
    );
    
    -- Assign admin role to school creator
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin'::app_role);
    
  ELSE
    -- User joining existing school
    INSERT INTO public.profiles (user_id, first_name, last_name, school_id)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 1)),
      COALESCE(new.raw_user_meta_data ->> 'last_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), ' ', 2)),
      existing_school_id
    );
    
    -- Map role - admin cannot be self-assigned
    CASE requested_role
      WHEN 'teacher' THEN valid_role := 'teacher'::app_role;
      ELSE valid_role := 'user'::app_role;
    END CASE;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, valid_role);
  END IF;
  
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block user creation
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  -- At minimum, create a basic profile so user can log in
  BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'first_name', split_part(COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email), ' ', 1)),
      COALESCE(new.raw_user_meta_data ->> 'last_name', '')
    )
    ON CONFLICT DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user'::app_role)
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user fallback error: %', SQLERRM;
  END;
  
  RETURN new;
END;
$$;
