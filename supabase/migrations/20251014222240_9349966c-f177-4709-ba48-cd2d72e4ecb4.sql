-- Create table for schedule/timetable management
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_subject_id UUID NOT NULL REFERENCES public.classroom_subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Add index for better query performance
CREATE INDEX idx_schedules_classroom_subject ON public.schedules(classroom_subject_id);
CREATE INDEX idx_schedules_day ON public.schedules(day_of_week);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can access their school's schedules
CREATE POLICY "Users can access their school's schedules"
ON public.schedules
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM classroom_subjects cs
    JOIN classrooms cl ON cl.id = cs.classroom_id
    JOIN campuses c ON c.id = cl.campus_id
    WHERE cs.id = schedules.classroom_subject_id
    AND user_belongs_to_school(c.school_id)
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_schedules_updated_at
BEFORE UPDATE ON public.schedules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add comment
COMMENT ON TABLE public.schedules IS 'Stores class schedules/timetables with day, time, and classroom assignments';