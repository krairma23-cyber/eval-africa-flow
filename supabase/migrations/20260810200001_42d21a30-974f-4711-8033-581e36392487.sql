CREATE OR REPLACE FUNCTION public.import_tuition_payments(
  p_start date,
  p_end date,
  p_dry_run boolean DEFAULT true
)
RETURNS TABLE(imported_count integer, imported_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_category_id uuid;
  v_count integer := 0;
  v_amount numeric := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.is_user_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can import payments';
  END IF;

  SELECT school_id INTO v_school_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'No school associated with this account';
  END IF;

  SELECT id INTO v_category_id
  FROM public.accounting_categories
  WHERE school_id = v_school_id AND kind = 'income' AND code = 'REC-01'
  LIMIT 1;

  IF v_category_id IS NULL THEN
    INSERT INTO public.accounting_categories (school_id, name, kind, code, color)
    VALUES (v_school_id, 'Frais de scolarité', 'income', 'REC-01', '#10b981')
    RETURNING id INTO v_category_id;
  END IF;

  CREATE TEMP TABLE _pending_payments ON COMMIT DROP AS
  SELECT
    pt.payment_reference,
    pt.amount,
    pt.payment_date::date AS entry_date,
    pt.payment_method,
    s.first_name || ' ' || s.last_name AS student_name
  FROM public.payment_transactions pt
  JOIN public.students s ON s.id = pt.student_id
  WHERE s.school_id = v_school_id
    AND pt.status = 'completed'
    AND pt.payment_date::date BETWEEN p_start AND p_end
    AND NOT EXISTS (
      SELECT 1 FROM public.accounting_entries ae
      WHERE ae.school_id = v_school_id
        AND ae.reference = 'PAY-' || pt.payment_reference
    );

  SELECT COUNT(*)::integer, COALESCE(SUM(amount), 0) INTO v_count, v_amount FROM _pending_payments;

  IF NOT p_dry_run AND v_count > 0 THEN
    INSERT INTO public.accounting_entries
      (school_id, category_id, entry_date, label, kind, amount, payment_method, reference, notes, created_by)
    SELECT
      v_school_id,
      v_category_id,
      p.entry_date,
      'Frais de scolarité — ' || p.student_name,
      'income',
      p.amount,
      COALESCE(p.payment_method, 'mobile_money'),
      'PAY-' || p.payment_reference,
      'Import automatique des paiements élèves',
      auth.uid()
    FROM _pending_payments p;
  END IF;

  RETURN QUERY SELECT v_count, v_amount;
END;
$$;

REVOKE ALL ON FUNCTION public.import_tuition_payments(date, date, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_tuition_payments(date, date, boolean) TO authenticated;