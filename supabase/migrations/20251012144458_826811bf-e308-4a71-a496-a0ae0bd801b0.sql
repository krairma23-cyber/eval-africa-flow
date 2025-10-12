-- Add SaaS settings columns to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS auto_backup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS data_retention TEXT DEFAULT '365';

-- Add comment for documentation
COMMENT ON COLUMN public.user_preferences.timezone IS 'User timezone for date/time display';
COMMENT ON COLUMN public.user_preferences.language IS 'User interface language';
COMMENT ON COLUMN public.user_preferences.currency IS 'Default currency for financial display';
COMMENT ON COLUMN public.user_preferences.date_format IS 'Date format preference';
COMMENT ON COLUMN public.user_preferences.auto_backup IS 'Enable automatic daily backups';
COMMENT ON COLUMN public.user_preferences.data_retention IS 'Data retention period in days (-1 for unlimited)';