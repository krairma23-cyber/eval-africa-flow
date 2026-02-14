
-- =====================================================
-- EVALSCOL COMMAND CENTER - DATABASE SCHEMA
-- =====================================================

-- Table: expenses tracking
CREATE TABLE public.command_center_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('hosting', 'payment_fees', 'marketing', 'salaries', 'saas_tools', 'support_telecom', 'other')),
  label TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'XOF',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.command_center_expenses ENABLE ROW LEVEL SECURITY;

-- Table: revenue snapshots (monthly)
CREATE TABLE public.command_center_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  mrr NUMERIC(12,2) DEFAULT 0,
  new_subscriptions INT DEFAULT 0,
  churned_subscriptions INT DEFAULT 0,
  upgrades INT DEFAULT 0,
  total_schools INT DEFAULT 0,
  total_students INT DEFAULT 0,
  total_teachers INT DEFAULT 0,
  total_parents INT DEFAULT 0,
  free_trials INT DEFAULT 0,
  paid_subscriptions INT DEFAULT 0,
  visitors INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month)
);

ALTER TABLE public.command_center_revenue ENABLE ROW LEVEL SECURITY;

-- Table: platform health metrics
CREATE TABLE public.command_center_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  storage_used_gb NUMERIC(8,2) DEFAULT 0,
  support_tickets INT DEFAULT 0,
  open_bugs INT DEFAULT 0,
  avg_onboarding_minutes INT DEFAULT 0,
  uptime_percent NUMERIC(5,2) DEFAULT 99.9,
  avg_response_time_ms INT DEFAULT 0,
  supabase_dependency_pct INT DEFAULT 85,
  paystack_dependency_pct INT DEFAULT 70,
  top3_school_revenue_pct INT DEFAULT 0,
  churn_rate NUMERIC(5,2) DEFAULT 0,
  tech_debt_score INT DEFAULT 0,
  retention_30d NUMERIC(5,2) DEFAULT 0,
  retention_90d NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(metric_date)
);

ALTER TABLE public.command_center_metrics ENABLE ROW LEVEL SECURITY;

-- Table: page usage analytics
CREATE TABLE public.command_center_page_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL,
  visit_count INT DEFAULT 0,
  avg_time_seconds INT DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.command_center_page_usage ENABLE ROW LEVEL SECURITY;

-- Security definer function to check super_admin via user_type
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
    AND user_type = 'super_admin'
  );
$$;

-- RLS Policies: only super_admin can access command center tables
CREATE POLICY "Super admin full access expenses"
ON public.command_center_expenses FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin full access revenue"
ON public.command_center_revenue FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin full access metrics"
ON public.command_center_metrics FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin full access page_usage"
ON public.command_center_page_usage FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_command_center_expenses_updated_at
BEFORE UPDATE ON public.command_center_expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_command_center_revenue_updated_at
BEFORE UPDATE ON public.command_center_revenue
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
