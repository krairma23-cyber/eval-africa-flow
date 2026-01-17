-- =====================================================
-- SECURITY FIX: Complete migration for profiles and students RLS
-- =====================================================

-- 1. Create a more secure version of user_teaches_student that validates school membership
CREATE OR REPLACE FUNCTION public.user_teaches_student_secure(p_student_id uuid, p_teacher_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM students s
    JOIN enrollments e ON e.student_id = s.id
    JOIN classroom_subjects cs ON cs.classroom_id = e.classroom_id
    JOIN teachers t ON t.id = cs.teacher_id
    JOIN profiles p ON p.user_id = p_teacher_user_id
    WHERE s.id = p_student_id 
      AND t.user_id = p_teacher_user_id
      -- Ensure teacher belongs to same school as student
      AND s.school_id = p.school_id
  );
$$;

-- 2. Update teachers can view students policy to use the secure function
DROP POLICY IF EXISTS "Teachers can view students they teach" ON public.students;

CREATE POLICY "Teachers can view students they teach securely"
ON public.students
FOR SELECT
TO authenticated
USING (
  is_teacher(auth.uid()) 
  AND user_teaches_student_secure(id, auth.uid())
);

-- 3. Create a view for teachers that excludes highly sensitive medical data
-- Uses correct column names from students table
CREATE OR REPLACE VIEW public.students_teacher_view AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.date_of_birth,
  s.gender,
  s.avatar_url,
  s.school_id,
  s.created_at,
  s.updated_at,
  -- Only include allergy info (important for classroom safety) but not full medical details
  s.allergies,
  -- Include parent contact for communication
  s.parent_name,
  s.parent_email,
  s.parent_phone
  -- Excluded: blood_type, medical_conditions, medications, medical_notes
  -- Excluded: doctor_name, doctor_phone, emergency contacts
  -- Excluded: tuition_fee, amount_paid, payment_status, payment_due_date, payment_notes, payment_method
FROM students s;

-- 4. Grant access to the view for authenticated users
GRANT SELECT ON public.students_teacher_view TO authenticated;

-- 5. Add comments explaining the security model
COMMENT ON VIEW public.students_teacher_view IS 
'Restricted view of students table for teachers. Excludes sensitive medical details (blood type, conditions, medications) and financial data. Teachers should use this view for daily operations.';

COMMENT ON FUNCTION public.user_teaches_student_secure IS
'Securely checks if a teacher teaches a student. Validates that the teacher belongs to the same school as the student, preventing cross-school data access.';