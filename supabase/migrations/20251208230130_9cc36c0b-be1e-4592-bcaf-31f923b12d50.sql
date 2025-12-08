-- Add medical information fields to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5),
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS doctor_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS medical_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.students.blood_type IS 'Blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)';
COMMENT ON COLUMN public.students.allergies IS 'Known allergies (food, medications, etc.)';
COMMENT ON COLUMN public.students.medical_conditions IS 'Medical conditions (asthma, diabetes, epilepsy, etc.)';
COMMENT ON COLUMN public.students.medications IS 'Current medications being taken';
COMMENT ON COLUMN public.students.emergency_contact_name IS 'Emergency contact name';
COMMENT ON COLUMN public.students.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN public.students.doctor_name IS 'Family doctor name';
COMMENT ON COLUMN public.students.doctor_phone IS 'Family doctor phone number';
COMMENT ON COLUMN public.students.medical_notes IS 'Additional medical notes or special needs';