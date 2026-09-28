REVOKE ALL ON public.teacher_invitations FROM anon;
REVOKE ALL ON public.school_memberships FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.teacher_invitations FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.school_memberships FROM authenticated;