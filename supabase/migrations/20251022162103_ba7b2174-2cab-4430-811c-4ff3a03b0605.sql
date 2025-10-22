-- Create student_attendance table
CREATE TABLE public.student_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create teacher_attendance table
CREATE TABLE public.teacher_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for student_attendance
CREATE POLICY "Users can access their school's student attendance"
ON public.student_attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_attendance.student_id
    AND user_belongs_to_school(s.school_id)
  )
);

-- Create policies for teacher_attendance
CREATE POLICY "Users can access their school's teacher attendance"
ON public.teacher_attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM teachers t
    WHERE t.id = teacher_attendance.teacher_id
    AND user_belongs_to_school(t.school_id)
  )
);

-- Create indexes for better performance
CREATE INDEX idx_student_attendance_student_date ON public.student_attendance(student_id, date);
CREATE INDEX idx_student_attendance_date ON public.student_attendance(date);
CREATE INDEX idx_teacher_attendance_teacher_date ON public.teacher_attendance(teacher_id, date);
CREATE INDEX idx_teacher_attendance_date ON public.teacher_attendance(date);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_student_attendance_updated_at
BEFORE UPDATE ON public.student_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_attendance_updated_at();

CREATE TRIGGER update_teacher_attendance_updated_at
BEFORE UPDATE ON public.teacher_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_attendance_updated_at();