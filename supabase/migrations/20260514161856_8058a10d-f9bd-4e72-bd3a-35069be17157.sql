-- ============ VUE SÉCURISÉE STANDARD (sans données médicales) ============
CREATE OR REPLACE VIEW public.students_safe
WITH (security_invoker = on) AS
SELECT
  id, school_id, student_number, first_name, last_name,
  date_of_birth, gender, parent_name, address, created_at, updated_at,
  avatar_url, tuition_fee, amount_paid, payment_status,
  payment_due_date, payment_notes, payment_method
FROM public.students;

GRANT SELECT ON public.students_safe TO authenticated;

-- ============ VUE MÉDICALE RESTREINTE ============
CREATE OR REPLACE VIEW public.students_medical
WITH (security_invoker = on) AS
SELECT
  s.id, s.school_id, s.first_name, s.last_name, s.student_number,
  s.blood_type, s.allergies, s.medical_conditions, s.medications,
  s.emergency_contact_name, s.emergency_contact_phone,
  s.doctor_name, s.doctor_phone, s.medical_notes,
  s.parent_phone, s.parent_email
FROM public.students s
WHERE public.has_role(auth.uid(), 'admin'::app_role)
  AND public.user_belongs_to_school(s.school_id);

GRANT SELECT ON public.students_medical TO authenticated;

-- ============ JOURNALISATION DES ACCÈS MÉDICAUX ============
CREATE OR REPLACE FUNCTION public.log_medical_access(
  _student_id uuid,
  _fields text[] DEFAULT ARRAY['medical']::text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.data_access_logs (
    user_id, accessed_table, accessed_record_id, action_type, accessed_fields, accessed_at
  )
  VALUES (
    auth.uid(), 'students', _student_id, 'MEDICAL_VIEW', _fields, now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_medical_access(uuid, text[]) TO authenticated;

-- ============ TABLE DES DEMANDES DE SUPPRESSION (RGPD art. 17) ============
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  scheduled_for timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  processed_at timestamptz,
  processed_by uuid,
  UNIQUE (user_id, status)
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own deletion requests"
ON public.account_deletion_requests FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users create own deletion requests"
ON public.account_deletion_requests FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users cancel own pending requests"
ON public.account_deletion_requests FOR DELETE TO authenticated
USING (user_id = auth.uid() AND status = 'pending');