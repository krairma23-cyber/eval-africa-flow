-- Create enums for user roles
CREATE TYPE app_role AS ENUM ('admin', 'director', 'teacher', 'secretary', 'parent');

-- Create schools table
CREATE TABLE public.schools (
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
CREATE TABLE public.campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create academic years table
CREATE TABLE public.academic_years (
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
CREATE TABLE public.terms (
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
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create grade levels table
CREATE TABLE public.grade_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  level_order integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create classrooms table
CREATE TABLE public.classrooms (
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
CREATE TABLE public.students (
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
CREATE TABLE public.teachers (
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
CREATE TABLE public.enrollments (
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
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(school_id, code)
);

-- Create classroom subjects table (which teacher teaches which subject in which classroom)
CREATE TABLE public.classroom_subjects (
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
CREATE TABLE public.assessment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  default_coefficient decimal(3,2) DEFAULT 1.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create assessments table
CREATE TABLE public.assessments (
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
CREATE TABLE public.assessment_results (
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
CREATE TABLE public.report_cards (
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

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  first_name text,
  last_name text,
  role app_role NOT NULL DEFAULT 'teacher',
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create function to check if user belongs to school
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

-- Create RLS policies

-- Schools: Admin can manage all, others can only view their school
CREATE POLICY "Admin can manage all schools" ON public.schools
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Users can view their school" ON public.schools
  FOR SELECT USING (public.user_belongs_to_school(id));

-- Profiles: Users can manage their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for other tables (school-based access)
CREATE POLICY "School members can access campuses" ON public.campuses
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "School members can access academic years" ON public.academic_years
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "School members can access terms" ON public.terms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.academic_years ay 
      WHERE ay.id = academic_year_id AND public.user_belongs_to_school(ay.school_id)
    )
  );

CREATE POLICY "School members can access programs" ON public.programs
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "School members can access grade levels" ON public.grade_levels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.programs p 
      WHERE p.id = program_id AND public.user_belongs_to_school(p.school_id)
    )
  );

CREATE POLICY "School members can access classrooms" ON public.classrooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campuses c 
      WHERE c.id = campus_id AND public.user_belongs_to_school(c.school_id)
    )
  );

CREATE POLICY "School members can access students" ON public.students
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "School members can access teachers" ON public.teachers
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "School members can access enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.user_belongs_to_school(s.school_id)
    )
  );

CREATE POLICY "School members can access subjects" ON public.subjects
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "School members can access classroom subjects" ON public.classroom_subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classrooms cl
      JOIN public.campuses c ON c.id = cl.campus_id
      WHERE cl.id = classroom_id AND public.user_belongs_to_school(c.school_id)
    )
  );

CREATE POLICY "School members can access assessment types" ON public.assessment_types
  FOR ALL USING (public.user_belongs_to_school(school_id));

CREATE POLICY "School members can access assessments" ON public.assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classroom_subjects cs
      JOIN public.classrooms cl ON cl.id = cs.classroom_id
      JOIN public.campuses c ON c.id = cl.campus_id
      WHERE cs.id = classroom_subject_id AND public.user_belongs_to_school(c.school_id)
    )
  );

CREATE POLICY "School members can access assessment results" ON public.assessment_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.user_belongs_to_school(s.school_id)
    )
  );

CREATE POLICY "School members can access report cards" ON public.report_cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.user_belongs_to_school(s.school_id)
    )
  );

-- Create trigger function to auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER handle_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_campuses_updated_at BEFORE UPDATE ON public.campuses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_terms_updated_at BEFORE UPDATE ON public.terms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_grade_levels_updated_at BEFORE UPDATE ON public.grade_levels FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_classrooms_updated_at BEFORE UPDATE ON public.classrooms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_classroom_subjects_updated_at BEFORE UPDATE ON public.classroom_subjects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_assessment_types_updated_at BEFORE UPDATE ON public.assessment_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_assessment_results_updated_at BEFORE UPDATE ON public.assessment_results FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_report_cards_updated_at BEFORE UPDATE ON public.report_cards FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'teacher')::app_role
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();