CREATE TABLE public.teacher_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teacher_invitations TO authenticated;
GRANT ALL ON public.teacher_invitations TO service_role;
ALTER TABLE public.teacher_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School admins view their invitations" ON public.teacher_invitations
  FOR SELECT TO authenticated USING (public.is_school_admin(school_id, auth.uid()));
CREATE INDEX teacher_invitations_school_idx ON public.teacher_invitations(school_id, created_at DESC);
CREATE TRIGGER teacher_invitations_updated_at BEFORE UPDATE ON public.teacher_invitations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.school_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'teacher',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, school_id)
);
GRANT SELECT ON public.school_memberships TO authenticated;
GRANT ALL ON public.school_memberships TO service_role;
ALTER TABLE public.school_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own memberships" ON public.school_memberships
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_school_admin(school_id, auth.uid()));

INSERT INTO public.school_memberships (user_id, school_id, role)
SELECT p.user_id, p.school_id,
  CASE WHEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=p.user_id AND r.role='admin') THEN 'admin'
       WHEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id=p.user_id AND r.role='teacher') THEN 'teacher'
       ELSE 'user' END
FROM public.profiles p WHERE p.school_id IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN RETURN NEW; END IF;
  IF current_setting('app.allow_school_switch', true) = 'on' THEN RETURN NEW; END IF;
  IF public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin') THEN RETURN NEW; END IF;
  IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN RAISE EXCEPTION 'Not allowed to change user_type'; END IF;
  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN RAISE EXCEPTION 'Not allowed to change school_id'; END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'Not allowed to change user_id'; END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.set_active_school(p_school_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.school_memberships WHERE user_id = auth.uid() AND school_id = p_school_id) THEN
    RAISE EXCEPTION 'Not a member of this school';
  END IF;
  PERFORM set_config('app.allow_school_switch', 'on', true);
  UPDATE public.profiles SET school_id = p_school_id, updated_at = now() WHERE user_id = auth.uid();
  PERFORM set_config('app.allow_school_switch', 'off', true);
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.set_active_school(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_active_school(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.join_school_by_code(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.join_school_with_code(text) FROM PUBLIC, anon, authenticated;