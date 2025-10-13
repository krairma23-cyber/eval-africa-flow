-- Create public bucket for school logos (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'school-logos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('school-logos', 'school-logos', true);
  ELSE
    UPDATE storage.buckets SET public = true WHERE id = 'school-logos';
  END IF;
END $$;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Public read access for school logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload logos to their school folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update logos in their school folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete logos in their school folder" ON storage.objects;

-- Policy 1: Public read access for school logos
CREATE POLICY "Public read access for school logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'school-logos');

-- Policy 2: Authenticated users can upload into their school folder
CREATE POLICY "Users can upload logos to their school folder"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school((storage.foldername(name))[1]::uuid)
);

-- Policy 3: Authenticated users can update objects in their school folder
CREATE POLICY "Users can update logos in their school folder"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school((storage.foldername(name))[1]::uuid)
)
WITH CHECK (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school((storage.foldername(name))[1]::uuid)
);

-- Policy 4: Authenticated users can delete/replace logos in their school folder
CREATE POLICY "Users can delete logos in their school folder"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'school-logos'
  AND public.user_belongs_to_school((storage.foldername(name))[1]::uuid)
);
