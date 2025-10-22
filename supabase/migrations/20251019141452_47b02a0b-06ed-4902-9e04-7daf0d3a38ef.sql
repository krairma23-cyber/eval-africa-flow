-- Create payment_transactions table for tracking tuition payments
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_reference TEXT NOT NULL UNIQUE,
  payment_method TEXT NOT NULL DEFAULT 'mobile_money',
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_email TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_transactions
CREATE POLICY "Users can view their school's payment transactions"
ON public.payment_transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.profiles p ON s.school_id = p.school_id
    WHERE s.id = payment_transactions.student_id
    AND p.id = auth.uid()
  )
);

CREATE POLICY "System can insert payment transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update payment transactions"
ON public.payment_transactions
FOR UPDATE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_payment_transactions_student_id ON public.payment_transactions(student_id);
CREATE INDEX idx_payment_transactions_reference ON public.payment_transactions(payment_reference);
CREATE INDEX idx_payment_transactions_date ON public.payment_transactions(payment_date DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_payment_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_transactions_updated_at();