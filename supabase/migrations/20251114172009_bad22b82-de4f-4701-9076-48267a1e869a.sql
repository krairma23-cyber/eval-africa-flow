-- Supprimer les anciens plans et créer les nouveaux plans corrects selon la knowledge base EvalScol

-- Désactiver et supprimer les anciens plans
DELETE FROM subscription_plans;

-- Plan Gratuit (Essai - 14 jours)
INSERT INTO subscription_plans (
  name, price_monthly, price_yearly, description, features,
  searches_limit, api_calls_limit, alerts_limit, export_limit,
  is_active, is_popular, currency, sort_order
) VALUES (
  'Gratuit (Essai)', 0, 0,
  'Testez la plateforme pendant 14 jours',
  '["14 jours d''essai gratuit", "Jusqu''à 50 élèves maximum", "Toutes les fonctionnalités de base", "Gestion des notes et bulletins", "Portail parent", "Support communautaire"]'::jsonb,
  50, 100, 10, 50, true, false, 'XOF', 1
);

-- Plan Standard
INSERT INTO subscription_plans (
  name, price_monthly, price_yearly, description, features,
  searches_limit, api_calls_limit, alerts_limit, export_limit,
  is_active, is_popular, currency, sort_order
) VALUES (
  'Standard', 29990, 299900,
  'Pour les écoles primaires et petits collèges',
  '["Jusqu''à 300 élèves", "Gestion complète élèves & enseignants", "Évaluations et bulletins automatisés", "Portail parent avec accès temps réel", "Paiements Paystack intégrés", "Analytics de base", "Support email"]'::jsonb,
  300, 1000, 50, 300, true, false, 'XOF', 2
);

-- Plan Professional (Le plus populaire)
INSERT INTO subscription_plans (
  name, price_monthly, price_yearly, description, features,
  searches_limit, api_calls_limit, alerts_limit, export_limit,
  is_active, is_popular, currency, sort_order
) VALUES (
  'Professional', 59990, 599900,
  'Pour les collèges et lycées moyens',
  '["Jusqu''à 1000 élèves", "Toutes les fonctionnalités Standard", "AI Assistant (génération contenu pédagogique)", "Détection élèves à risque (IA)", "Analytics avancés", "Webhooks et API", "Support prioritaire", "Personnalisation logo/couleurs"]'::jsonb,
  1000, 5000, 100, 1000, true, true, 'XOF', 3
);

-- Plan Enterprise
INSERT INTO subscription_plans (
  name, price_monthly, price_yearly, description, features,
  searches_limit, api_calls_limit, alerts_limit, export_limit,
  is_active, is_popular, currency, sort_order
) VALUES (
  'Enterprise', 149990, 1499900,
  'Pour les groupes scolaires et réseaux d''écoles',
  '["Élèves illimités", "Toutes les fonctionnalités Professional", "Multi-établissements", "Intégrations personnalisées", "Formation sur site", "Support 24/7", "SLA garantie 99.9%", "Serveur dédié (option)", "Développements sur mesure"]'::jsonb,
  999999, 999999, 999999, 999999, true, false, 'XOF', 4
);