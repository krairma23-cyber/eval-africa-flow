CREATE TABLE public.school_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  row_count integer NOT NULL DEFAULT 0,
  tables_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  trigger_source text NOT NULL DEFAULT 'cron',
  retention_days integer NOT NULL DEFAULT 365,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.school_backups TO authenticated;
GRANT ALL ON public.school_backups TO service_role;

ALTER TABLE public.school_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School admins read own backups"
ON public.school_backups FOR SELECT TO authenticated
USING (public.is_school_admin(school_id, auth.uid()) OR public.is_super_admin(auth.uid()));

CREATE POLICY "Service role manages backups"
ON public.school_backups FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE INDEX idx_school_backups_school_created ON public.school_backups(school_id, created_at DESC);

CREATE TRIGGER trg_school_backups_updated_at
BEFORE UPDATE ON public.school_backups
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage policies: backups readable only by admins of the owning school
CREATE POLICY "School admins read own backup files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'school-backups'
  AND (
    public.is_super_admin(auth.uid())
    OR public.is_school_admin(((storage.foldername(name))[1])::uuid, auth.uid())
  )
);