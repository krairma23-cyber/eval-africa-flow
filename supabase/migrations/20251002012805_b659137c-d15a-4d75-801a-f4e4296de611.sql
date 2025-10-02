-- Ajouter la colonne logo_url à la table schools
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS logo_url text;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Public can view school logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "School admins can delete logos" ON storage.objects;

-- RLS policies pour le bucket school-logos
-- Tout le monde peut voir les logos (bucket public)
CREATE POLICY "Public can view school logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'school-logos');

-- Les admins d'école peuvent uploader leur logo
CREATE POLICY "School admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'school-logos' 
  AND (storage.foldername(name))[1] IN (
    SELECT s.id::text 
    FROM public.schools s
    JOIN public.profiles p ON p.school_id = s.id
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Les admins d'école peuvent mettre à jour leur logo
CREATE POLICY "School admins can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'school-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT s.id::text 
    FROM public.schools s
    JOIN public.profiles p ON p.school_id = s.id
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

-- Les admins d'école peuvent supprimer leur logo
CREATE POLICY "School admins can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'school-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT s.id::text 
    FROM public.schools s
    JOIN public.profiles p ON p.school_id = s.id
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);