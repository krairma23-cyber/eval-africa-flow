-- Add payment_method column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS payment_method text;