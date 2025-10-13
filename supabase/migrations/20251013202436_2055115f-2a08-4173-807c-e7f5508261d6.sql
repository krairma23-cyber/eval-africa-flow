-- Créer un établissement par défaut pour les utilisateurs existants sans school_id
DO $$
DECLARE
  user_profile RECORD;
  new_school_id UUID;
BEGIN
  -- Pour chaque profil sans school_id
  FOR user_profile IN 
    SELECT user_id, first_name, last_name 
    FROM public.profiles 
    WHERE school_id IS NULL
  LOOP
    -- Créer un établissement par défaut
    INSERT INTO public.schools (
      name,
      address,
      academic_year,
      created_at,
      updated_at
    ) VALUES (
      COALESCE(user_profile.first_name || ' ' || user_profile.last_name, 'Mon École'),
      '123 Rue de l''École, Paris',
      '2025-2026',
      NOW(),
      NOW()
    )
    RETURNING id INTO new_school_id;
    
    -- Mettre à jour le profil avec le nouvel établissement
    UPDATE public.profiles
    SET school_id = new_school_id,
        updated_at = NOW()
    WHERE user_id = user_profile.user_id;
  END LOOP;
END $$;

-- Créer une fonction pour auto-créer un établissement lors de la création d'un profil
CREATE OR REPLACE FUNCTION public.ensure_user_has_school()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_school_id UUID;
BEGIN
  -- Si pas de school_id, créer un établissement par défaut
  IF NEW.school_id IS NULL THEN
    INSERT INTO public.schools (
      name,
      address,
      academic_year,
      created_at,
      updated_at
    ) VALUES (
      COALESCE(NEW.first_name || ' ' || NEW.last_name, 'Mon École'),
      '123 Rue de l''École, Paris',
      '2025-2026',
      NOW(),
      NOW()
    )
    RETURNING id INTO new_school_id;
    
    NEW.school_id = new_school_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer un trigger pour auto-créer l'établissement
DROP TRIGGER IF EXISTS ensure_school_on_profile_insert ON public.profiles;
CREATE TRIGGER ensure_school_on_profile_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_user_has_school();