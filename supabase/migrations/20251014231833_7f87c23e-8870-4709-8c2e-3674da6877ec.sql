-- D'abord, supprimer la politique qui dépend de classroom_subject_id
DROP POLICY IF EXISTS "Users can access their school's schedules" ON public.schedules;

-- Ajouter les nouvelles colonnes
ALTER TABLE public.schedules 
ADD COLUMN classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
ADD COLUMN teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE;

-- Migrer les données existantes si il y en a
UPDATE public.schedules s
SET 
  classroom_id = cs.classroom_id,
  subject_id = cs.subject_id,
  teacher_id = cs.teacher_id
FROM public.classroom_subjects cs
WHERE s.classroom_subject_id = cs.id;

-- Rendre les nouvelles colonnes NOT NULL (seulement si on a des données)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM public.schedules LIMIT 1) THEN
    ALTER TABLE public.schedules 
    ALTER COLUMN classroom_id SET NOT NULL,
    ALTER COLUMN subject_id SET NOT NULL,
    ALTER COLUMN teacher_id SET NOT NULL;
  END IF;
END $$;

-- Supprimer l'ancienne colonne
ALTER TABLE public.schedules DROP COLUMN IF EXISTS classroom_subject_id;

-- Si la table est vide, on rend les colonnes NOT NULL maintenant
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'schedules' 
                 AND column_name = 'classroom_id' 
                 AND is_nullable = 'NO') THEN
    ALTER TABLE public.schedules 
    ALTER COLUMN classroom_id SET NOT NULL,
    ALTER COLUMN subject_id SET NOT NULL,
    ALTER COLUMN teacher_id SET NOT NULL;
  END IF;
END $$;

-- Recréer la politique RLS avec les nouvelles colonnes
CREATE POLICY "Users can access their school's schedules"
ON public.schedules
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM classrooms cl
    JOIN campuses c ON c.id = cl.campus_id
    WHERE cl.id = schedules.classroom_id
    AND user_belongs_to_school(c.school_id)
  )
);

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_schedules_classroom ON public.schedules(classroom_id);
CREATE INDEX IF NOT EXISTS idx_schedules_subject ON public.schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON public.schedules(teacher_id);