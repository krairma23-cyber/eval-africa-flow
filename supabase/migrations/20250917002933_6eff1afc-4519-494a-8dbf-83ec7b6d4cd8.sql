-- Add some sample data for testing

-- First, let's get the school ID
DO $$
DECLARE
    school_uuid uuid;
    campus_uuid uuid;
    program_uuid uuid;
    grade_uuid uuid;
    year_uuid uuid;
    term_uuid uuid;
    teacher1_uuid uuid;
    teacher2_uuid uuid;
    classroom_uuid uuid;
    student1_uuid uuid;
    student2_uuid uuid;
    student3_uuid uuid;
    math_subject_uuid uuid;
    french_subject_uuid uuid;
BEGIN
    -- Get existing school
    SELECT id INTO school_uuid FROM public.schools WHERE name = 'École Primaire ABC' LIMIT 1;
    
    IF school_uuid IS NOT NULL THEN
        -- Get existing references
        SELECT id INTO campus_uuid FROM public.campuses WHERE school_id = school_uuid LIMIT 1;
        SELECT id INTO program_uuid FROM public.programs WHERE school_id = school_uuid LIMIT 1;
        SELECT id INTO grade_uuid FROM public.grade_levels WHERE program_id = program_uuid LIMIT 1;
        SELECT id INTO year_uuid FROM public.academic_years WHERE school_id = school_uuid LIMIT 1;
        SELECT id INTO term_uuid FROM public.terms WHERE academic_year_id = year_uuid LIMIT 1;
        SELECT id INTO classroom_uuid FROM public.classrooms WHERE campus_id = campus_uuid LIMIT 1;
        
        -- Insert teachers
        INSERT INTO public.teachers (school_id, teacher_number, first_name, last_name, email, phone, specialization, hire_date)
        VALUES 
        (school_uuid, 'T001', 'Marie', 'Kouassi', 'marie.kouassi@ecole-abc.ci', '+225 05 06 07 08', 'Mathématiques', '2020-09-01'),
        (school_uuid, 'T002', 'Jean', 'Diabaté', 'jean.diabate@ecole-abc.ci', '+225 07 08 09 10', 'Français', '2019-09-01')
        ON CONFLICT (teacher_number) DO NOTHING
        RETURNING id INTO teacher1_uuid;
        
        -- Get teacher IDs if they already exist
        IF teacher1_uuid IS NULL THEN
            SELECT id INTO teacher1_uuid FROM public.teachers WHERE teacher_number = 'T001' LIMIT 1;
            SELECT id INTO teacher2_uuid FROM public.teachers WHERE teacher_number = 'T002' LIMIT 1;
        ELSE
            SELECT id INTO teacher2_uuid FROM public.teachers WHERE teacher_number = 'T002' LIMIT 1;
        END IF;
        
        -- Get subject IDs
        SELECT id INTO math_subject_uuid FROM public.subjects WHERE school_id = school_uuid AND code = 'MATH' LIMIT 1;
        SELECT id INTO french_subject_uuid FROM public.subjects WHERE school_id = school_uuid AND code = 'FR' LIMIT 1;
        
        -- Insert classroom subjects (assign teachers to subjects in classrooms)
        IF teacher1_uuid IS NOT NULL AND math_subject_uuid IS NOT NULL AND classroom_uuid IS NOT NULL THEN
            INSERT INTO public.classroom_subjects (classroom_id, subject_id, teacher_id, coefficient)
            VALUES (classroom_uuid, math_subject_uuid, teacher1_uuid, 2.0)
            ON CONFLICT (classroom_id, subject_id) DO NOTHING;
        END IF;
        
        IF teacher2_uuid IS NOT NULL AND french_subject_uuid IS NOT NULL AND classroom_uuid IS NOT NULL THEN
            INSERT INTO public.classroom_subjects (classroom_id, subject_id, teacher_id, coefficient)
            VALUES (classroom_uuid, french_subject_uuid, teacher2_uuid, 2.0)
            ON CONFLICT (classroom_id, subject_id) DO NOTHING;
        END IF;
        
        -- Insert students
        INSERT INTO public.students (school_id, student_number, first_name, last_name, date_of_birth, gender, parent_name, parent_phone, parent_email)
        VALUES 
        (school_uuid, 'E2024001', 'Aya', 'Traoré', '2014-03-15', 'F', 'Fatou Traoré', '+225 01 23 45 67', 'fatou.traore@gmail.com'),
        (school_uuid, 'E2024002', 'Koffi', 'Yao', '2014-07-22', 'M', 'Emmanuel Yao', '+225 02 34 56 78', 'emmanuel.yao@yahoo.fr'),
        (school_uuid, 'E2024003', 'Aminata', 'Sanogo', '2014-01-10', 'F', 'Mariam Sanogo', '+225 03 45 67 89', 'mariam.sanogo@hotmail.com'),
        (school_uuid, 'E2024004', 'Ibrahim', 'Coulibaly', '2013-11-05', 'M', 'Bakary Coulibaly', '+225 04 56 78 90', 'bakary.coulibaly@gmail.com'),
        (school_uuid, 'E2024005', 'Fatoumata', 'Diabaté', '2014-05-18', 'F', 'Aissata Diabaté', '+225 05 67 89 01', 'aissata.diabate@yahoo.fr')
        ON CONFLICT (student_number) DO NOTHING;
        
        -- Get student IDs
        SELECT id INTO student1_uuid FROM public.students WHERE student_number = 'E2024001' LIMIT 1;
        SELECT id INTO student2_uuid FROM public.students WHERE student_number = 'E2024002' LIMIT 1;
        SELECT id INTO student3_uuid FROM public.students WHERE student_number = 'E2024003' LIMIT 1;
        
        -- Enroll students in the classroom
        IF classroom_uuid IS NOT NULL AND year_uuid IS NOT NULL THEN
            INSERT INTO public.enrollments (student_id, classroom_id, academic_year_id, enrollment_date, status)
            VALUES 
            (student1_uuid, classroom_uuid, year_uuid, '2024-09-01', 'active'),
            (student2_uuid, classroom_uuid, year_uuid, '2024-09-01', 'active'),
            (student3_uuid, classroom_uuid, year_uuid, '2024-09-01', 'active')
            ON CONFLICT (student_id, classroom_id, academic_year_id) DO NOTHING;
        END IF;
        
    END IF;
END $$;