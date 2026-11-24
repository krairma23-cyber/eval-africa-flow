// Mirrors the official billing grid shown in /dashboard/billing (subscription_plans table).
export const PUBLIC_PLANS = [
  { id: "free-trial", name: "Gratuit (Essai)", monthly: 0, yearly: 0, students: "Jusqu'à 50 élèves", popular: false,
    features: ["14 jours d'essai gratuit", "Toutes les fonctionnalités de base", "Gestion des notes et bulletins", "Portail parent", "Support communautaire"],
    ideal: "Idéal pour tester la plateforme", cta: "Essayer gratuitement" },
  { id: "standard", name: "Standard", monthly: 29990, yearly: 299900, students: "Jusqu'à 300 élèves", popular: false,
    features: ["Gestion complète élèves & enseignants", "Évaluations et bulletins automatisés", "Portail parent en temps réel", "Paiements Paystack intégrés", "Analytics de base", "Support email"],
    ideal: "Idéal pour écoles primaires et petits collèges", cta: "Choisir Standard" },
  { id: "professional", name: "Professional", monthly: 59990, yearly: 599900, students: "Jusqu'à 1000 élèves", popular: true,
    features: ["Toutes les fonctionnalités Standard", "AI Assistant (contenu pédagogique)", "Détection élèves à risque (IA)", "Analytics avancés avec prédictions", "Webhooks et API REST", "Support prioritaire (12h)", "Personnalisation logo/couleurs"],
    ideal: "Idéal pour collèges et lycées moyens", cta: "Choisir Professional" },
  { id: "enterprise", name: "Enterprise", monthly: 149990, yearly: 1499900, students: "Élèves illimités", popular: false,
    features: ["Toutes les fonctionnalités Professional", "Multi-établissements & multi-campus", "Intégrations personnalisées", "Formation sur site incluse", "Support 24/7 avec SLA 99,9%", "Serveur dédié (option)"],
    ideal: "Idéal pour groupes scolaires et réseaux", cta: "Demander un devis" },
] as const;
export const fcfa = (n: number) => n.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
