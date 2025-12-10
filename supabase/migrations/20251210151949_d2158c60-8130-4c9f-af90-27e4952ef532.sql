-- Fix SECURITY DEFINER functions missing SET search_path = public
-- This prevents privilege escalation via search_path manipulation attacks

-- 1. update_attendance_updated_at
CREATE OR REPLACE FUNCTION public.update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. update_user_plan_features_updated_at
CREATE OR REPLACE FUNCTION public.update_user_plan_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. update_inscriptions_pme_updated_at
CREATE OR REPLACE FUNCTION public.update_inscriptions_pme_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. update_inscriptions_updated_at
CREATE OR REPLACE FUNCTION public.update_inscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. update_payment_transactions_updated_at
CREATE OR REPLACE FUNCTION public.update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. set_invoice_number
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE 'INV-%';
    
    NEW.invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. auto_encrypt_inscription
CREATE OR REPLACE FUNCTION public.auto_encrypt_inscription()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_encrypted := TRUE;
  NEW.gdpr_compliant := TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. cleanup_old_cron_jobs
CREATE OR REPLACE FUNCTION public.cleanup_old_cron_jobs()
RETURNS void AS $$
BEGIN
  DELETE FROM cron_jobs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. update_pme_rating_stats
CREATE OR REPLACE FUNCTION public.update_pme_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  review_cnt INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_cnt
  FROM pme_reviews
  WHERE pme_id = COALESCE(NEW.pme_id, OLD.pme_id);
  
  UPDATE pmes
  SET average_rating = avg_rating,
      review_count = review_cnt
  WHERE id = COALESCE(NEW.pme_id, OLD.pme_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. enforce_ai_usage_user_id
CREATE OR REPLACE FUNCTION public.enforce_ai_usage_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. log_reservation_access
CREATE OR REPLACE FUNCTION public.log_reservation_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO data_access_logs (
    table_name,
    record_id,
    access_type,
    accessed_by
  ) VALUES (
    TG_TABLE_NAME,
    NEW.id::TEXT,
    TG_OP,
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. enforce_password_policy
CREATE OR REPLACE FUNCTION public.enforce_password_policy()
RETURNS TRIGGER AS $$
BEGIN
  -- Password policy is enforced by Supabase Auth
  -- This is a placeholder for additional validation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 14. monitor_admin_data_access
CREATE OR REPLACE FUNCTION public.monitor_admin_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log admin data access for audit
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO data_access_logs (
      table_name,
      record_id,
      access_type,
      accessed_by,
      justification
    ) VALUES (
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id)::TEXT,
      TG_OP,
      auth.uid(),
      'Admin data access'
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;