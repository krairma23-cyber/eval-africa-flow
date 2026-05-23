-- Remove tables from realtime publication to prevent cross-tenant broadcast leakage
ALTER PUBLICATION supabase_realtime DROP TABLE public.payment_notifications;
ALTER PUBLICATION supabase_realtime DROP TABLE public.schools;