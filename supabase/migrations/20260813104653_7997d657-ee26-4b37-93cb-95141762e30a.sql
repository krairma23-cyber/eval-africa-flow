-- 1. profiles: lock defaults on self-insert
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND school_id IS NULL
  AND (user_type IS NULL OR user_type = 'pending')
  AND (subscription_plan IS NULL OR subscription_plan = 'starter'::subscription_plan)
  AND (subscription_status IS NULL OR subscription_status = 'active')
  AND (monthly_searches_limit IS NULL OR monthly_searches_limit = 100)
  AND (searches_count IS NULL OR searches_count = 0)
);

-- 2. teachers: whitelist-based column lock (defense in depth on top of RLS)
CREATE OR REPLACE FUNCTION public.prevent_teacher_sensitive_fields_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  -- Self-service teachers may only change first_name, last_name, phone, avatar_url
  NEW.id             := OLD.id;
  NEW.school_id      := OLD.school_id;
  NEW.user_id        := OLD.user_id;
  NEW.teacher_number := OLD.teacher_number;
  NEW.email          := OLD.email;
  NEW.specialization := OLD.specialization;
  NEW.hire_date      := OLD.hire_date;
  NEW.created_at     := OLD.created_at;

  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "Teachers can update own contact info (columns locked by trigger" ON public.teachers;
CREATE POLICY "Teachers can update own contact info"
ON public.teachers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND school_id = public.get_user_school_id()
);

-- 3. accounting: require a non-null school scope and admin role
DROP POLICY IF EXISTS acct_categories_admin_insert ON public.accounting_categories;
CREATE POLICY acct_categories_admin_insert ON public.accounting_categories
FOR INSERT TO authenticated
WITH CHECK (
  school_id IS NOT NULL
  AND public.get_user_school_id() IS NOT NULL
  AND school_id = public.get_user_school_id()
  AND public.is_user_admin(auth.uid())
);

DROP POLICY IF EXISTS acct_categories_admin_update ON public.accounting_categories;
CREATE POLICY acct_categories_admin_update ON public.accounting_categories
FOR UPDATE TO authenticated
USING (
  school_id IS NOT NULL
  AND public.get_user_school_id() IS NOT NULL
  AND school_id = public.get_user_school_id()
  AND public.is_user_admin(auth.uid())
)
WITH CHECK (
  school_id IS NOT NULL
  AND public.get_user_school_id() IS NOT NULL
  AND school_id = public.get_user_school_id()
  AND public.is_user_admin(auth.uid())
);

DROP POLICY IF EXISTS acct_entries_admin_insert ON public.accounting_entries;
CREATE POLICY acct_entries_admin_insert ON public.accounting_entries
FOR INSERT TO authenticated
WITH CHECK (
  school_id IS NOT NULL
  AND public.get_user_school_id() IS NOT NULL
  AND school_id = public.get_user_school_id()
  AND public.is_user_admin(auth.uid())
);

DROP POLICY IF EXISTS acct_entries_admin_update ON public.accounting_entries;
CREATE POLICY acct_entries_admin_update ON public.accounting_entries
FOR UPDATE TO authenticated
USING (
  school_id IS NOT NULL
  AND public.get_user_school_id() IS NOT NULL
  AND school_id = public.get_user_school_id()
  AND public.is_user_admin(auth.uid())
)
WITH CHECK (
  school_id IS NOT NULL
  AND public.get_user_school_id() IS NOT NULL
  AND school_id = public.get_user_school_id()
  AND public.is_user_admin(auth.uid())
);