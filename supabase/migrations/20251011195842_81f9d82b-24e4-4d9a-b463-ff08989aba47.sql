-- Ensure school-logos bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist to recreate them correctly
DROP POLICY IF EXISTS "Public can view school logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their school logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their school logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their school logo" ON storage.objects;

-- Allow public read access to school logos
CREATE POLICY "Public can view school logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

-- Allow authenticated users to upload their school's logo
CREATE POLICY "Users can upload their school logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'school-logos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT school_id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update their school's logo
CREATE POLICY "Users can update their school logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'school-logos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT school_id::text FROM profiles WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to delete their school's logo
CREATE POLICY "Users can delete their school logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'school-logos' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT school_id::text FROM profiles WHERE user_id = auth.uid()
  )
);