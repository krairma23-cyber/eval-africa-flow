-- Create schools table (avoid creating app_role enum as it already exists)
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

-- Create campuses table
CREATE TABLE IF NOT EXISTS public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create academic years table
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

-- Create terms table
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

-- Create programs table
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create grade levels table
CREATE TABLE IF NOT EXISTS public.grade_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  level_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create classrooms table
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

-- Create students table
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

-- Create teachers table
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

-- Create enrollments table
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

-- Create subjects table
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

-- Create classroom subjects table
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

-- Create assessment types table
CREATE TABLE IF NOT EXISTS public.assessment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_coefficient decimal(3,2) DEFAULT 1.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create assessments table
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

-- Create assessment results table
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

-- Create report cards table
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

-- Add role column to existing profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='school_id') THEN
        ALTER TABLE public.profiles ADD COLUMN school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

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

-- Basic RLS policies for schools (allow users to access their school's data)
CREATE POLICY "Users can access their school" ON public.schools
  FOR ALL USING (public.user_belongs_to_school(id) OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can access their school's campuses" ON public.campuses
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "Users can access their school's academic years" ON public.academic_years
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "Users can access their school's terms" ON public.terms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.academic_years ay 
      WHERE ay.id = academic_year_id AND public.user_belongs_to_school(ay.school_id)
    )
  );

CREATE POLICY "Users can access their school's programs" ON public.programs
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "Users can access their school's grade levels" ON public.grade_levels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.programs p 
      WHERE p.id = program_id AND public.user_belongs_to_school(p.school_id)
    )
  );

CREATE POLICY "Users can access their school's classrooms" ON public.classrooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campuses c 
      WHERE c.id = campus_id AND public.user_belongs_to_school(c.school_id)
    )
  );

CREATE POLICY "Users can access their school's students" ON public.students
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "Users can access their school's teachers" ON public.teachers
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "Users can access their school's enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.user_belongs_to_school(s.school_id)
    )
  );

CREATE POLICY "Users can access their school's subjects" ON public.subjects
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "Users can access their school's classroom subjects" ON public.classroom_subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classrooms cl
      JOIN public.campuses c ON c.id = cl.campus_id
      WHERE cl.id = classroom_id AND public.user_belongs_to_school(c.school_id)
    )
  );

CREATE POLICY "Users can access their school's assessment types" ON public.assessment_types
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "Users can access their school's assessments" ON public.assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classroom_subjects cs
      JOIN public.classrooms cl ON cl.id = cs.classroom_id
      JOIN public.campuses c ON c.id = cl.campus_id
      WHERE cs.id = classroom_subject_id AND public.user_belongs_to_school(c.school_id)
    )
  );

CREATE POLICY "Users can access their school's assessment results" ON public.assessment_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.user_belongs_to_school(s.school_id)
    )
  );

CREATE POLICY "Users can access their school's report cards" ON public.report_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.user_belongs_to_school(s.school_id)
    )
  );