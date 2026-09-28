DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS school_logos_public_read ON storage.objects;
CREATE POLICY school_logos_admin_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'school-logos' AND (storage.foldername(name))[1] = public.get_user_school_id()::text);