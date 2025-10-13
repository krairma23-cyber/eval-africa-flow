-- Ensure RLS enabled on teachers and allow INSERT properly
DO $$ BEGIN
  -- Enable RLS (idempotent)
  PERFORM 1 FROM pg_tables WHERE schemaname='public' AND tablename='teachers';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Create explicit INSERT policy for teachers if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'teachers' 
      AND policyname = 'Users can insert teachers for their school'
  ) THEN
    CREATE POLICY "Users can insert teachers for their school"
    ON public.teachers
    FOR INSERT TO authenticated
    WITH CHECK (public.user_belongs_to_school(school_id) OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Ensure SELECT policy exists for authenticated users (complements existing FOR ALL policies if any)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'teachers' 
      AND policyname = 'Users can select teachers for their school'
  ) THEN
    CREATE POLICY "Users can select teachers for their school"
    ON public.teachers
    FOR SELECT TO authenticated
    USING (public.user_belongs_to_school(school_id) OR public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;