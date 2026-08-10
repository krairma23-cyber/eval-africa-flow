CREATE TABLE public.accounting_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  code text,
  color text NOT NULL DEFAULT '#3b82f6',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounting_categories TO authenticated;
GRANT ALL ON public.accounting_categories TO service_role;
ALTER TABLE public.accounting_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acct_categories_select_own_school"
ON public.accounting_categories FOR SELECT TO authenticated
USING (school_id = public.get_user_school_id());

CREATE POLICY "acct_categories_admin_insert"
ON public.accounting_categories FOR INSERT TO authenticated
WITH CHECK (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "acct_categories_admin_update"
ON public.accounting_categories FOR UPDATE TO authenticated
USING (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()))
WITH CHECK (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "acct_categories_admin_delete"
ON public.accounting_categories FOR DELETE TO authenticated
USING (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()));

CREATE TABLE public.accounting_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  category_id uuid REFERENCES public.accounting_categories(id) ON DELETE SET NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('income','expense')),
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  payment_method text,
  reference text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounting_entries_school_date ON public.accounting_entries(school_id, entry_date DESC);
CREATE INDEX idx_accounting_categories_school ON public.accounting_categories(school_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounting_entries TO authenticated;
GRANT ALL ON public.accounting_entries TO service_role;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acct_entries_select_own_school"
ON public.accounting_entries FOR SELECT TO authenticated
USING (school_id = public.get_user_school_id());

CREATE POLICY "acct_entries_admin_insert"
ON public.accounting_entries FOR INSERT TO authenticated
WITH CHECK (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "acct_entries_admin_update"
ON public.accounting_entries FOR UPDATE TO authenticated
USING (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()))
WITH CHECK (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()));

CREATE POLICY "acct_entries_admin_delete"
ON public.accounting_entries FOR DELETE TO authenticated
USING (school_id = public.get_user_school_id() AND public.is_user_admin(auth.uid()));

CREATE TRIGGER trg_accounting_categories_updated_at
BEFORE UPDATE ON public.accounting_categories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_accounting_entries_updated_at
BEFORE UPDATE ON public.accounting_entries
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_accounting_entries_no_school_change
BEFORE UPDATE ON public.accounting_entries
FOR EACH ROW EXECUTE FUNCTION public.prevent_school_id_change();

CREATE TRIGGER trg_accounting_categories_no_school_change
BEFORE UPDATE ON public.accounting_categories
FOR EACH ROW EXECUTE FUNCTION public.prevent_school_id_change();

CREATE OR REPLACE FUNCTION public.seed_accounting_categories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school uuid := public.get_user_school_id();
  v_count integer;
BEGIN
  IF v_school IS NULL THEN
    RAISE EXCEPTION 'Aucune école associée à cet utilisateur';
  END IF;
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;

  SELECT count(*) INTO v_count FROM public.accounting_categories WHERE school_id = v_school;
  IF v_count > 0 THEN
    RETURN 0;
  END IF;

  INSERT INTO public.accounting_categories (school_id, name, kind, code, color) VALUES
    (v_school, 'Frais de scolarité', 'income', 'REC-01', '#10b981'),
    (v_school, 'Frais d''inscription', 'income', 'REC-02', '#22c55e'),
    (v_school, 'Cantine', 'income', 'REC-03', '#84cc16'),
    (v_school, 'Transport', 'income', 'REC-04', '#14b8a6'),
    (v_school, 'Dons et subventions', 'income', 'REC-05', '#06b6d4'),
    (v_school, 'Autres recettes', 'income', 'REC-99', '#3b82f6'),
    (v_school, 'Salaires', 'expense', 'DEP-01', '#ef4444'),
    (v_school, 'Loyer', 'expense', 'DEP-02', '#f97316'),
    (v_school, 'Électricité & eau', 'expense', 'DEP-03', '#f59e0b'),
    (v_school, 'Fournitures scolaires', 'expense', 'DEP-04', '#a855f7'),
    (v_school, 'Maintenance', 'expense', 'DEP-05', '#ec4899'),
    (v_school, 'Transport & carburant', 'expense', 'DEP-06', '#8b5cf6'),
    (v_school, 'Autres dépenses', 'expense', 'DEP-99', '#6b7280');

  RETURN 13;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_accounting_categories() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_accounting_categories() TO authenticated;