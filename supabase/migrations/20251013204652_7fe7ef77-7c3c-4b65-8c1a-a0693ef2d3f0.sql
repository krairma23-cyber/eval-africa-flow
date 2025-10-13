-- Donner le rôle admin aux utilisateurs existants qui n'en ont pas
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = profiles.user_id AND ur.role = 'admin'::app_role
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Mettre à jour la fonction pour donner automatiquement le rôle admin
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
    
    -- Donner le rôle admin à l'utilisateur pour son école
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;