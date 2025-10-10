-- Update subscription plans features to match EvalScol (school management system)
-- instead of marketplace features

-- Update Starter plan features
UPDATE subscription_plans
SET 
  features = jsonb_build_array(
    'Jusqu''à 30 élèves',
    'Gestion basique des notes',
    'Bulletins simples',
    'Tableau de bord de base',
    'Support communautaire'
  ),
  api_calls_limit = 100,
  description = 'Idéal pour les petites classes ou pour tester la plateforme'
WHERE name = 'Starter';

-- Update Professional plan features  
UPDATE subscription_plans
SET 
  features = jsonb_build_array(
    'Jusqu''à 300 élèves',
    'Évaluations illimitées',
    'Analytics prédictifs avec IA',
    'Assistant vocal',
    'Rapports avancés et bulletins personnalisés',
    'Gestion des absences',
    'Communication parents-enseignants',
    'Support prioritaire'
  ),
  description = 'Pour les établissements de taille moyenne recherchant des fonctionnalités avancées'
WHERE name = 'Professional';

-- Update Enterprise plan features
UPDATE subscription_plans  
SET 
  features = jsonb_build_array(
    'Plus de 300 élèves (illimité)',
    'Tout du plan Professional',
    'Multi-campus et multi-écoles',
    'Personnalisation complète',
    'Intégrations API avancées',
    'Formation dédiée du personnel',
    'SLA et support premium 24/7',
    'Modules métier personnalisés',
    'Comptes multi-utilisateurs illimités'
  ),
  description = 'Solution complète pour les grands établissements et groupes scolaires'
WHERE name = 'Enterprise';