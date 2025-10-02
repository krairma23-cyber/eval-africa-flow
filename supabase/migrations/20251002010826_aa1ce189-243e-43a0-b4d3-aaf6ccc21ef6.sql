-- Créer un bucket pour les logos d'établissements
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-logos', 
  'school-logos', 
  true,
  2097152, -- 2MB max
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Ajouter la colonne logo_url à la table schools si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'schools' 
    AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE public.schools ADD COLUMN logo_url text;
  END IF;
END $$;

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