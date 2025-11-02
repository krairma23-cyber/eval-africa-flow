-- Create user_plan_features table to track activated features per user
CREATE TABLE IF NOT EXISTS public.user_plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL, -- 'starter', 'professional', 'enterprise'
  
  -- Student limits
  max_students INTEGER NOT NULL DEFAULT 30,
  unlimited_students BOOLEAN NOT NULL DEFAULT false,
  
  -- Feature flags
  basic_grade_management BOOLEAN NOT NULL DEFAULT true,
  unlimited_assessments BOOLEAN NOT NULL DEFAULT false,
  predictive_analytics_ai BOOLEAN NOT NULL DEFAULT false,
  voice_assistant BOOLEAN NOT NULL DEFAULT false,
  advanced_reports BOOLEAN NOT NULL DEFAULT false,
  attendance_management BOOLEAN NOT NULL DEFAULT false,
  parent_teacher_communication BOOLEAN NOT NULL DEFAULT false,
  multi_campus BOOLEAN NOT NULL DEFAULT false,
  full_customization BOOLEAN NOT NULL DEFAULT false,
  advanced_api_integrations BOOLEAN NOT NULL DEFAULT false,
  dedicated_training BOOLEAN NOT NULL DEFAULT false,
  premium_support_24_7 BOOLEAN NOT NULL DEFAULT false,
  custom_business_modules BOOLEAN NOT NULL DEFAULT false,
  unlimited_user_accounts BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_plan CHECK (plan_id IN ('starter', 'professional', 'enterprise'))
);

-- Enable RLS
ALTER TABLE public.user_plan_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own features"
  ON public.user_plan_features
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only service role can manage features"
  ON public.user_plan_features
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_plan_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_user_plan_features_timestamp
  BEFORE UPDATE ON public.user_plan_features
  FOR EACH ROW
  EXECUTE FUNCTION update_user_plan_features_updated_at();

-- Add index for faster lookups
CREATE INDEX idx_user_plan_features_user_id ON public.user_plan_features(user_id);
CREATE INDEX idx_user_plan_features_plan_id ON public.user_plan_features(plan_id);

-- Add comment
COMMENT ON TABLE public.user_plan_features IS 'Stores activated features and limits for each user based on their subscription plan';