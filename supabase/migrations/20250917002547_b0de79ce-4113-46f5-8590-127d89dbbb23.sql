-- Check if schools table exists, if not create it
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text DEFAULT 'Côte d''Ivoire',
  address text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create other core tables for the education system
CREATE TABLE IF NOT EXISTS public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.grade_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  level_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id uuid NOT NULL REFERENCES public.campuses(id) ON DELETE CASCADE,
  grade_level_id uuid NOT NULL REFERENCES public.grade_levels(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('M', 'F')),
  parent_name text,
  parent_phone text,
  parent_email text,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  teacher_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  specialization text,
  hire_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(school_id, code)
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'completed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, classroom_id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS public.classroom_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  coefficient decimal(3,2) DEFAULT 1.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(classroom_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.assessment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_coefficient decimal(3,2) DEFAULT 1.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_subject_id uuid NOT NULL REFERENCES public.classroom_subjects(id) ON DELETE CASCADE,
  assessment_type_id uuid NOT NULL REFERENCES public.assessment_types(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assessment_date date NOT NULL,
  max_score decimal(5,2) NOT NULL DEFAULT 20.0,
  coefficient decimal(3,2) NOT NULL DEFAULT 1.0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'graded', 'validated')),
  created_by uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  score decimal(5,2),
  comment text,
  is_absent boolean DEFAULT false,
  graded_by uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  graded_at timestamp with time zone,
  validated_by uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  validated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(assessment_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  overall_average decimal(5,2),
  rank_in_class integer,
  total_students integer,
  general_comment text,
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at timestamp with time zone DEFAULT now(),
  pdf_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(student_id, term_id)
);

-- Add school_id to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'school_id') THEN
    ALTER TABLE public.profiles ADD COLUMN school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on all new tables (if not already enabled)
DO $$
DECLARE
  table_record record;
BEGIN
  FOR table_record IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('schools', 'campuses', 'academic_years', 'terms', 'programs', 'grade_levels', 
                      'classrooms', 'students', 'teachers', 'subjects', 'enrollments', 
                      'classroom_subjects', 'assessment_types', 'assessments', 
                      'assessment_results', 'report_cards')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', table_record.schemaname, table_record.tablename);
  END LOOP;
END $$;

-- Create helper functions
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS uuid
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT school_id FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_school(school_uuid uuid)
RETURNS boolean
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND school_id = school_uuid
  );
$$;

-- Create basic RLS policies for school-based access
DO $$
BEGIN
  -- Schools policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Users can view their school') THEN
    CREATE POLICY "Users can view their school" ON public.schools
      FOR SELECT USING (public.user_belongs_to_school(id) OR has_role(auth.uid(), 'admin'));
  END IF;

  -- Students policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'School members can access students') THEN
    CREATE POLICY "School members can access students" ON public.students
      FOR ALL USING (public.user_belongs_to_school(school_id) OR has_role(auth.uid(), 'admin'));
  END IF;

  -- Teachers policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teachers' AND policyname = 'School members can access teachers') THEN
    CREATE POLICY "School members can access teachers" ON public.teachers
      FOR ALL USING (public.user_belongs_to_school(school_id) OR has_role(auth.uid(), 'admin'));
  END IF;

  -- Subjects policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'School members can access subjects') THEN
    CREATE POLICY "School members can access subjects" ON public.subjects
      FOR ALL USING (public.user_belongs_to_school(school_id) OR has_role(auth.uid(), 'admin'));
  END IF;

  -- Assessments policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'School members can access assessments') THEN
    CREATE POLICY "School members can access assessments" ON public.assessments
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.classroom_subjects cs
          JOIN public.classrooms cl ON cl.id = cs.classroom_id
          JOIN public.campuses c ON c.id = cl.campus_id
          WHERE cs.id = classroom_subject_id AND public.user_belongs_to_school(c.school_id)
        ) OR has_role(auth.uid(), 'admin')
      );
  END IF;

  -- Assessment results policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessment_results' AND policyname = 'School members can access assessment results') THEN
    CREATE POLICY "School members can access assessment results" ON public.assessment_results
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.students s 
          WHERE s.id = student_id AND public.user_belongs_to_school(s.school_id)
        ) OR has_role(auth.uid(), 'admin')
      );
  END IF;
END $$;

-- Insert some basic data
INSERT INTO public.schools (name, country, address, phone, email) 
VALUES ('École Primaire ABC', 'Côte d''Ivoire', 'Abidjan, Cocody', '+225 01 02 03 04', 'ecole.abc@example.ci')
ON CONFLICT DO NOTHING;

-- Get the school ID for the demo school
DO $$
DECLARE
    school_uuid uuid;
    campus_uuid uuid;
    program_uuid uuid;
    grade_uuid uuid;
    year_uuid uuid;
    term_uuid uuid;
BEGIN
    SELECT id INTO school_uuid FROM public.schools WHERE name = 'École Primaire ABC' LIMIT 1;
    
    IF school_uuid IS NOT NULL THEN
        -- Insert campus
        INSERT INTO public.campuses (school_id, name, address)
        VALUES (school_uuid, 'Campus Principal', 'Bâtiment A, Cocody')
        ON CONFLICT DO NOTHING
        RETURNING id INTO campus_uuid;
        
        IF campus_uuid IS NULL THEN
            SELECT id INTO campus_uuid FROM public.campuses WHERE school_id = school_uuid LIMIT 1;
        END IF;

        -- Insert program
        INSERT INTO public.programs (school_id, name, description)
        VALUES (school_uuid, 'Enseignement Primaire', 'Programme d''enseignement primaire')
        ON CONFLICT DO NOTHING
        RETURNING id INTO program_uuid;
        
        IF program_uuid IS NULL THEN
            SELECT id INTO program_uuid FROM public.programs WHERE school_id = school_uuid LIMIT 1;
        END IF;

        -- Insert academic year
        INSERT INTO public.academic_years (school_id, name, start_date, end_date, is_current)
        VALUES (school_uuid, '2024-2025', '2024-09-01', '2025-06-30', true)
        ON CONFLICT DO NOTHING
        RETURNING id INTO year_uuid;
        
        IF year_uuid IS NULL THEN
            SELECT id INTO year_uuid FROM public.academic_years WHERE school_id = school_uuid LIMIT 1;
        END IF;

        -- Insert term
        INSERT INTO public.terms (academic_year_id, name, start_date, end_date, is_current)
        VALUES (year_uuid, 'Premier Trimestre', '2024-09-01', '2024-12-15', true)
        ON CONFLICT DO NOTHING
        RETURNING id INTO term_uuid;

        -- Insert grade level
        INSERT INTO public.grade_levels (program_id, name, level_order)
        VALUES (program_uuid, 'CM1', 4)
        ON CONFLICT DO NOTHING
        RETURNING id INTO grade_uuid;
        
        IF grade_uuid IS NULL THEN
            SELECT id INTO grade_uuid FROM public.grade_levels WHERE program_id = program_uuid LIMIT 1;
        END IF;

        -- Insert classroom
        INSERT INTO public.classrooms (campus_id, grade_level_id, academic_year_id, name, capacity)
        VALUES (campus_uuid, grade_uuid, year_uuid, 'CM1-A', 35)
        ON CONFLICT DO NOTHING;

        -- Insert basic subjects
        INSERT INTO public.subjects (school_id, name, code, description) VALUES 
        (school_uuid, 'Mathématiques', 'MATH', 'Mathématiques élémentaires'),
        (school_uuid, 'Français', 'FR', 'Langue française'),
        (school_uuid, 'Sciences', 'SCI', 'Sciences et technologie'),
        (school_uuid, 'Histoire-Géographie', 'HG', 'Histoire et géographie'),
        (school_uuid, 'Éducation Physique', 'EPS', 'Éducation physique et sportive')
        ON CONFLICT (school_id, code) DO NOTHING;

        -- Insert assessment types
        INSERT INTO public.assessment_types (school_id, name, description, default_coefficient) VALUES
        (school_uuid, 'Devoir', 'Devoir sur table', 1.0),
        (school_uuid, 'Contrôle', 'Contrôle de connaissances', 2.0),
        (school_uuid, 'Examen', 'Examen de fin de période', 3.0)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;