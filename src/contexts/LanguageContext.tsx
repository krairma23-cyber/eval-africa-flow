import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.pricing': 'Tarification',
    'nav.features': 'Fonctionnalités',
    'nav.contact': 'Contact',
    'nav.login': 'Connexion',
    'nav.signup': 'Inscription',
    'nav.dashboard': 'Tableau de bord',
    'nav.logout': 'Déconnexion',
    
    // Hero
    'hero.title': 'La plateforme de gestion scolaire conçue pour l\'Afrique',
    'hero.subtitle': 'Transformez la gestion de votre établissement avec EvalScol Africa - la solution SaaS complète pour les écoles africaines francophones.',
    'hero.cta.trial': 'Essai gratuit 14 jours',
    'hero.cta.demo': 'Voir la démo',
    
    // About
    'about.title': 'À propos d\'EvalScol Africa',
    'about.back': 'Retour à l\'accueil',
    'about.what.title': 'Qu\'est-ce qu\'EvalScol Africa ?',
    'about.what.description': 'EvalScol Africa est une plateforme SaaS complète de gestion scolaire spécialement conçue pour les établissements éducatifs en Afrique francophone. Solution 100% cloud, elle transforme radicalement la gestion administrative, pédagogique et financière des écoles.',
    'about.problems.title': 'Problèmes résolus',
    'about.why.title': 'Pourquoi choisir EvalScol ?',
    'about.features.title': 'Fonctionnalités clés',
    'about.tech.title': 'Architecture technique',
    'about.coverage.title': 'Couverture',
    'about.support.title': 'Support & Contact',
    'about.cta.pricing': 'Voir les tarifs',
    'about.cta.trial': 'Essai gratuit',
    'about.cta.contact': 'Nous contacter',
    
    // Features
    'features.admin': 'Administration',
    'features.evaluations': 'Évaluations',
    'features.parents': 'Portail Parent',
    'features.finance': 'Finances',
    'features.ai': 'Intelligence Artificielle',
    'features.analytics': 'Analytics',
    
    // Pricing
    'pricing.title': 'Tarification',
    'pricing.subtitle': 'Choisissez le plan adapté à votre établissement',
    'pricing.free': 'Essai Gratuit',
    'pricing.standard': 'Standard',
    'pricing.professional': 'Professionnel',
    'pricing.enterprise': 'Enterprise',
    'pricing.month': '/mois',
    'pricing.students': 'élèves',
    'pricing.cta': 'Commencer',
    'pricing.popular': 'Populaire',
    
    // Support
    'support.title': 'Support',
    'support.email': 'Email',
    'support.phone': 'Téléphone',
    'support.hours': 'Horaires',
    'support.response': 'Temps de réponse',
    
    // Footer
    'footer.rights': 'Tous droits réservés',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    
    // Countries
    'countries.supported': 'Pays supportés',
    'countries.ci': 'Côte d\'Ivoire',
    'countries.sn': 'Sénégal',
    'countries.bj': 'Bénin',
    'countries.tg': 'Togo',
    'countries.ml': 'Mali',
    'countries.bf': 'Burkina Faso',
    'countries.cm': 'Cameroun',
    'countries.gn': 'Guinée',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.pricing': 'Pricing',
    'nav.features': 'Features',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.title': 'The School Management Platform Built for Africa',
    'hero.subtitle': 'Transform your institution\'s management with EvalScol Africa - the complete SaaS solution for African schools.',
    'hero.cta.trial': '14-Day Free Trial',
    'hero.cta.demo': 'Watch Demo',
    
    // About
    'about.title': 'About EvalScol Africa',
    'about.back': 'Back to Home',
    'about.what.title': 'What is EvalScol Africa?',
    'about.what.description': 'EvalScol Africa is a comprehensive SaaS school management platform specifically designed for educational institutions in Francophone Africa. A 100% cloud solution, it radically transforms the administrative, pedagogical and financial management of schools.',
    'about.problems.title': 'Problems Solved',
    'about.why.title': 'Why Choose EvalScol?',
    'about.features.title': 'Key Features',
    'about.tech.title': 'Technical Architecture',
    'about.coverage.title': 'Coverage',
    'about.support.title': 'Support & Contact',
    'about.cta.pricing': 'View Pricing',
    'about.cta.trial': 'Free Trial',
    'about.cta.contact': 'Contact Us',
    
    // Features
    'features.admin': 'Administration',
    'features.evaluations': 'Assessments',
    'features.parents': 'Parent Portal',
    'features.finance': 'Finance',
    'features.ai': 'Artificial Intelligence',
    'features.analytics': 'Analytics',
    
    // Pricing
    'pricing.title': 'Pricing',
    'pricing.subtitle': 'Choose the plan that fits your institution',
    'pricing.free': 'Free Trial',
    'pricing.standard': 'Standard',
    'pricing.professional': 'Professional',
    'pricing.enterprise': 'Enterprise',
    'pricing.month': '/month',
    'pricing.students': 'students',
    'pricing.cta': 'Get Started',
    'pricing.popular': 'Popular',
    
    // Support
    'support.title': 'Support',
    'support.email': 'Email',
    'support.phone': 'Phone',
    'support.hours': 'Business Hours',
    'support.response': 'Response Time',
    
    // Footer
    'footer.rights': 'All rights reserved',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    
    // Countries
    'countries.supported': 'Supported Countries',
    'countries.ci': 'Ivory Coast',
    'countries.sn': 'Senegal',
    'countries.bj': 'Benin',
    'countries.tg': 'Togo',
    'countries.ml': 'Mali',
    'countries.bf': 'Burkina Faso',
    'countries.cm': 'Cameroon',
    'countries.gn': 'Guinea',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('evalscol-language');
    return (saved as Language) || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('evalscol-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
