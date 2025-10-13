-- Create public avatars bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow public read access to avatars bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'storage'
      AND p.tablename = 'objects'
      AND p.policyname = 'Avatar images are publicly accessible'
  ) THEN
    CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;
END $$;

-- Allow authenticated users to upload files to avatars bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'storage'
      AND p.tablename = 'objects'
      AND p.policyname = 'Authenticated can upload avatars'
  ) THEN
    CREATE POLICY "Authenticated can upload avatars"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');
  END IF;
END $$;