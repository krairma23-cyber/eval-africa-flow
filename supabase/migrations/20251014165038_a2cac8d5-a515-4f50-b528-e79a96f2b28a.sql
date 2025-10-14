-- Fix RLS policies for schools table to allow updates by school admins and users

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.schools;
DROP POLICY IF EXISTS "School admins can update their school" ON public.schools;
DROP POLICY IF EXISTS "Users can update their own school" ON public.schools;

-- Create comprehensive RLS policies for schools
CREATE POLICY "Enable read access for all authenticated users"
ON public.schools
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own school
CREATE POLICY "Users can update their own school"
ON public.schools
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.school_id = schools.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.school_id = schools.id
  )
);

-- Fix user_preferences INSERT policy to enforce user_id
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);