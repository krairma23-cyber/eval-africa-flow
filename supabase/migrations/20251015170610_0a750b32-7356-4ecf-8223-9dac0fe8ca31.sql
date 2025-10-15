-- Ajouter les colonnes manquantes à la table terms
ALTER TABLE public.terms 
ADD COLUMN IF NOT EXISTS school_id UUID,
ADD COLUMN IF NOT EXISTS term_number INTEGER;

-- Mettre à jour les lignes existantes avec des valeurs par défaut si nécessaire
UPDATE public.terms 
SET school_id = (
  SELECT school_id 
  FROM public.academic_years 
  WHERE id = terms.academic_year_id 
  LIMIT 1
)
WHERE school_id IS NULL;

-- Rendre school_id NOT NULL
ALTER TABLE public.terms 
ALTER COLUMN school_id SET NOT NULL;

-- Ajouter les contraintes
ALTER TABLE public.terms 
ADD CONSTRAINT valid_term_number CHECK (term_number >= 1 AND term_number <= 3);

-- Créer un index unique si pas déjà existant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_term_per_year'
  ) THEN
    ALTER TABLE public.terms 
    ADD CONSTRAINT unique_term_per_year UNIQUE(academic_year_id, term_number);
  END IF;
END $$;

-- Ajouter les index
CREATE INDEX IF NOT EXISTS idx_terms_school_id ON public.terms(school_id);
CREATE INDEX IF NOT EXISTS idx_terms_term_number ON public.terms(term_number);

-- Ajouter la politique RLS si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'terms' 
    AND policyname = 'Users can access their school terms'
  ) THEN
    CREATE POLICY "Users can access their school terms"
      ON public.terms
      FOR ALL
      TO authenticated
      USING (
        school_id IN (
          SELECT school_id FROM public.profiles 
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;