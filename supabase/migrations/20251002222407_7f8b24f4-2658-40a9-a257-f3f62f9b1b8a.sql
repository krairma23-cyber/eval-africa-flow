-- Create support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS public.support_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own tickets
CREATE POLICY "Users can create their own tickets"
  ON public.support_tickets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets (not status/resolved fields)
CREATE POLICY "Users can update their own tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update all tickets
CREATE POLICY "Admins can update all tickets"
  ON public.support_tickets
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for support_faqs
-- Anyone can view published FAQs
CREATE POLICY "Anyone can view published FAQs"
  ON public.support_faqs
  FOR SELECT
  USING (published = true);

-- Admins can manage FAQs
CREATE POLICY "Admins can manage FAQs"
  ON public.support_faqs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_school_id ON public.support_tickets(school_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX idx_support_faqs_category ON public.support_faqs(category);
CREATE INDEX idx_support_faqs_published ON public.support_faqs(published);

-- Trigger for updated_at
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER support_faqs_updated_at
  BEFORE UPDATE ON public.support_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert some default FAQs
INSERT INTO public.support_faqs (question, answer, category, views) VALUES
('Comment créer une évaluation ?', 'Pour créer une évaluation, rendez-vous dans la section "Évaluations" et cliquez sur "Nouvelle évaluation". Remplissez les informations requises comme le titre, la date, la matière et le type d''évaluation.', 'general', 1250),
('Comment inviter des enseignants ?', 'Dans la section "Enseignants", cliquez sur "Nouvel enseignant" et saisissez les informations de l''enseignant. Un email d''invitation sera envoyé automatiquement.', 'general', 890),
('Comment ajouter des élèves ?', 'Accédez à la section "Élèves", cliquez sur "Nouvel élève" et remplissez le formulaire avec les informations de l''élève et de ses parents.', 'general', 756),
('Comment générer des rapports ?', 'Dans la section "Rapports", sélectionnez le type de rapport souhaité, choisissez la période et les filtres, puis cliquez sur "Générer".', 'fonctionnalite', 654),
('Comment changer mon plan d''abonnement ?', 'Rendez-vous dans "Paramètres" > "Facturation" pour voir les plans disponibles et changer votre abonnement.', 'facturation', 543),
('Problèmes de connexion', 'Si vous rencontrez des problèmes de connexion, vérifiez votre email et mot de passe. Utilisez la fonction "Mot de passe oublié" si nécessaire.', 'technique', 432),
('Comment organiser les classes ?', 'Dans la section "Classes", créez une nouvelle classe en spécifiant le niveau, l''année scolaire et la capacité. Vous pouvez ensuite y inscrire des élèves.', 'general', 389),
('Sécurité des données', 'Toutes vos données sont chiffrées et stockées de manière sécurisée. Nous respectons le RGPD et les normes de protection des données.', 'securite', 276);