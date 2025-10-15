-- Add tuition fee management columns to students table
ALTER TABLE public.students 
ADD COLUMN tuition_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN amount_paid NUMERIC(10,2) DEFAULT 0,
ADD COLUMN payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
ADD COLUMN payment_due_date DATE,
ADD COLUMN payment_notes TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.students.tuition_fee IS 'Montant total des frais de scolarité';
COMMENT ON COLUMN public.students.amount_paid IS 'Montant déjà payé';
COMMENT ON COLUMN public.students.payment_status IS 'Statut du paiement: unpaid, partial, paid';
COMMENT ON COLUMN public.students.payment_due_date IS 'Date limite de paiement';
COMMENT ON COLUMN public.students.payment_notes IS 'Notes sur le paiement';