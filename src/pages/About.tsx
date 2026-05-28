import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Target, 
  Users, 
  Globe, 
  TrendingUp, 
  CheckCircle2, 
  Zap,
  Shield,
  Clock,
  HeartHandshake,
  Rocket,
  MapPin,
  Phone,
  Mail,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import Seo from "@/components/Seo";

export default function About() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const problems = language === 'fr' ? [
    {
      icon: Target,
      title: "Gestion manuelle inefficace",
      description: "Fin des registres papier, des calculs de moyennes à la main et des erreurs de saisie. Automatisation complète de tous les processus."
    },
    {
      icon: Users,
      title: "Manque de visibilité pour les parents",
      description: "Les parents accèdent enfin aux résultats de leurs enfants en temps réel, avec historique complet et notifications automatiques."
    },
    {
      icon: TrendingUp,
      title: "Absence d'analyse prédictive",
      description: "Identification automatique des élèves en difficulté grâce à l'IA, suivi longitudinal des performances et interventions ciblées."
    },
    {
      icon: Globe,
      title: "Communication limitée",
      description: "Communication fluide entre administration, enseignants et parents via portail web, notifications et rapports automatisés."
    }
  ] : [
    {
      icon: Target,
      title: "Inefficient Manual Management",
      description: "Say goodbye to paper registers, manual grade calculations, and data entry errors. Complete automation of all processes."
    },
    {
      icon: Users,
      title: "Lack of Visibility for Parents",
      description: "Parents finally access their children's results in real-time, with complete history and automatic notifications."
    },
    {
      icon: TrendingUp,
      title: "No Predictive Analytics",
      description: "Automatic identification of struggling students through AI, longitudinal performance tracking, and targeted interventions."
    },
    {
      icon: Globe,
      title: "Limited Communication",
      description: "Seamless communication between administration, teachers, and parents via web portal, notifications, and automated reports."
    }
  ];

  const advantages = language === 'fr' ? [
    {
      icon: Zap,
      title: "100% Cloud",
      description: "Accessible partout, sur tous les appareils (ordinateur, tablette, smartphone), sans installation ni maintenance.",
      color: "text-yellow-500"
    },
    {
      icon: Globe,
      title: "Adapté à l'Afrique",
      description: "Conçu pour les réalités des établissements africains : contexte éducatif local, fuseau horaire GMT, programmes francophones.",
      color: "text-green-500"
    },
    {
      icon: HeartHandshake,
      title: "Support local",
      description: "Équipe disponible en français et langues locales (Wolof, Bambara, Ewe, Yoruba), formée aux contextes africains.",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Économique",
      description: "Plus besoin d'infrastructure coûteuse. Paiement mensuel flexible avec mobile money. ROI rapide grâce aux gains de temps.",
      color: "text-purple-500"
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Données protégées avec chiffrement SSL/TLS, conformité RGPD, sauvegardes automatiques quotidiennes, audit logs complets.",
      color: "text-red-500"
    },
    {
      icon: Sparkles,
      title: "Intelligence Artificielle",
      description: "IA native pour génération de contenu pédagogique, détection d'élèves à risque, analyses prédictives et recommandations.",
      color: "text-cyan-500"
    }
  ] : [
    {
      icon: Zap,
      title: "100% Cloud",
      description: "Accessible everywhere, on all devices (computer, tablet, smartphone), with no installation or maintenance required.",
      color: "text-yellow-500"
    },
    {
      icon: Globe,
      title: "Built for Africa",
      description: "Designed for African schools: local educational context, GMT timezone, francophone and anglophone programs.",
      color: "text-green-500"
    },
    {
      icon: HeartHandshake,
      title: "Local Support",
      description: "Team available in French, English, and local languages (Wolof, Bambara, Ewe, Yoruba), trained in African contexts.",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Cost-Effective",
      description: "No expensive infrastructure needed. Flexible monthly payments with mobile money. Quick ROI through time savings.",
      color: "text-purple-500"
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Data protected with SSL/TLS encryption, GDPR compliant, daily automatic backups, complete audit logs.",
      color: "text-red-500"
    },
    {
      icon: Sparkles,
      title: "Artificial Intelligence",
      description: "Native AI for educational content generation, at-risk student detection, predictive analytics, and recommendations.",
      color: "text-cyan-500"
    }
  ];

  const keyFeatures = language === 'fr' ? [
    {
      category: "Gestion Administrative",
      features: [
        "Gestion complète des élèves avec inscriptions, profils, photos",
        "Gestion des enseignants avec qualifications et affectations",
        "Organisation des classes, matières, emplois du temps",
        "Calendrier scolaire avec périodes et événements"
      ]
    },
    {
      category: "Évaluations & Bulletins",
      features: [
        "Système d'évaluation avancé avec coefficients personnalisables",
        "Types d'évaluation configurables (interrogations, devoirs, examens, etc.)",
        "Calculs automatiques des moyennes et classements",
        "Génération automatique de bulletins PDF professionnels"
      ]
    },
    {
      category: "Portail Parent",
      features: [
        "Accès sécurisé avec identifiants uniques",
        "Consultation en temps réel des notes, absences, bulletins",
        "Historique complet de tous les trimestres et années",
        "Notifications automatiques pour nouveaux bulletins et événements"
      ]
    },
    {
      category: "Finances & Paiements",
      features: [
        "Intégration Paystack complète (mobile money + cartes bancaires)",
        "Paiement de frais de scolarité en ligne",
        "Suivi automatique des paiements et soldes",
        "Génération de reçus PDF automatiques"
      ]
    },
    {
      category: "Intelligence Artificielle",
      features: [
        "AI Assistant pour génération de contenu pédagogique",
        "Détection automatique d'élèves à risque avec scoring",
        "Analyses prédictives et recommandations d'intervention",
        "Assistant vocal pour navigation (plans Pro+)"
      ]
    },
    {
      category: "Analytics & Rapports",
      features: [
        "Dashboard en temps réel avec KPIs",
        "Analytics avancés avec graphiques interactifs",
        "Statistiques par classe, matière, période",
        "Rapports analytiques exportables"
      ]
    }
  ] : [
    {
      category: "Administrative Management",
      features: [
        "Complete student management with enrollments, profiles, photos",
        "Teacher management with qualifications and assignments",
        "Class, subject, and schedule organization",
        "School calendar with terms and events"
      ]
    },
    {
      category: "Assessments & Report Cards",
      features: [
        "Advanced evaluation system with customizable coefficients",
        "Configurable assessment types (quizzes, assignments, exams, etc.)",
        "Automatic grade and ranking calculations",
        "Automatic professional PDF report card generation"
      ]
    },
    {
      category: "Parent Portal",
      features: [
        "Secure access with unique credentials",
        "Real-time access to grades, absences, report cards",
        "Complete history of all terms and years",
        "Automatic notifications for new reports and events"
      ]
    },
    {
      category: "Finance & Payments",
      features: [
        "Complete Paystack integration (mobile money + bank cards)",
        "Online tuition fee payment",
        "Automatic payment and balance tracking",
        "Automatic PDF receipt generation"
      ]
    },
    {
      category: "Artificial Intelligence",
      features: [
        "AI Assistant for educational content generation",
        "Automatic at-risk student detection with scoring",
        "Predictive analytics and intervention recommendations",
        "Voice assistant for navigation (Pro+ plans)"
      ]
    },
    {
      category: "Analytics & Reports",
      features: [
        "Real-time dashboard with KPIs",
        "Advanced analytics with interactive charts",
        "Statistics by class, subject, period",
        "Exportable analytical reports"
      ]
    }
  ];

  const offices = language === 'fr' ? [
    {
      country: "Côte d'Ivoire",
      flag: "🇨🇮",
      city: "Abidjan",
      type: "Bureau principal",
      color: "bg-orange-100 text-orange-800"
    },
    {
      country: "Sénégal",
      flag: "🇸🇳",
      city: "Dakar",
      type: "Bureau",
      color: "bg-green-100 text-green-800"
    },
    {
      country: "Bénin",
      flag: "🇧🇯",
      city: "Cotonou",
      type: "Partenaire",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      country: "Togo",
      flag: "🇹🇬",
      city: "Lomé",
      type: "Partenaire",
      color: "bg-blue-100 text-blue-800"
    }
  ] : [
    {
      country: "Ivory Coast",
      flag: "🇨🇮",
      city: "Abidjan",
      type: "Headquarters",
      color: "bg-orange-100 text-orange-800"
    },
    {
      country: "Senegal",
      flag: "🇸🇳",
      city: "Dakar",
      type: "Office",
      color: "bg-green-100 text-green-800"
    },
    {
      country: "Benin",
      flag: "🇧🇯",
      city: "Cotonou",
      type: "Partner",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      country: "Togo",
      flag: "🇹🇬",
      city: "Lomé",
      type: "Partner",
      color: "bg-blue-100 text-blue-800"
    }
  ];

  const texts = language === 'fr' ? {
    back: "Retour à l'accueil",
    title: "À Propos d'EvalScol Africa",
    subtitle: "La plateforme SaaS complète de gestion scolaire pour l'Afrique francophone",
    whatIs: "Qu'est-ce qu'EvalScol Africa ?",
    whatIsDesc1: "EvalScol Africa est une plateforme SaaS (Software as a Service) complète de gestion scolaire spécialement conçue pour les établissements éducatifs en Afrique francophone. Solution 100% cloud, elle transforme radicalement la gestion administrative, pédagogique et financière des écoles en automatisant l'ensemble des processus éducatifs.",
    whatIsDesc2: "Notre mission est de digitaliser l'éducation en Afrique en offrant aux écoles une solution moderne, accessible, économique et adaptée à leurs réalités locales. De la petite école primaire au grand groupe scolaire, EvalScol accompagne tous les établissements dans leur transformation numérique.",
    problems: "Les Problèmes que Nous Résolvons",
    whyChoose: "Pourquoi Choisir EvalScol ?",
    features: "Fonctionnalités Principales",
    techStack: "Architecture Technique",
    frontend: "Frontend",
    backend: "Backend",
    integrations: "Intégrations",
    security: "Sécurité",
    presence: "Présence en Afrique",
    languages: "Langues supportées",
    languagesList: "Français, Anglais, Wolof, Bambara, Ewe, Yoruba",
    support: "Support et Accompagnement",
    phone: "Téléphone / WhatsApp",
    hours: "Lun-Ven: 8h-18h GMT",
    email: "Email",
    responseTime: "Délai de Réponse",
    standard: "Standard: 24-48h",
    professional: "Professional: 12h",
    enterprise: "Enterprise: 4h (24/7)",
    cta: "Transformez Votre École Aujourd'hui",
    ctaDesc: "Rejoignez les établissements qui font confiance à EvalScol pour digitaliser leur gestion scolaire en Afrique.",
    viewPricing: "Voir les Tarifs",
    freeTrial: "Essai Gratuit 14 Jours",
    contactTeam: "Contacter l'Équipe",
    noCreditCard: "Pas de carte bancaire requise • Support en français • Formation incluse"
  } : {
    back: "Back to Home",
    title: "About EvalScol Africa",
    subtitle: "The complete SaaS school management platform for Africa",
    whatIs: "What is EvalScol Africa?",
    whatIsDesc1: "EvalScol Africa is a comprehensive SaaS (Software as a Service) school management platform specifically designed for educational institutions in Africa. A 100% cloud solution, it radically transforms the administrative, pedagogical, and financial management of schools by automating all educational processes.",
    whatIsDesc2: "Our mission is to digitize education in Africa by offering schools a modern, accessible, affordable solution adapted to their local realities. From small primary schools to large school groups, EvalScol supports all institutions in their digital transformation.",
    problems: "Problems We Solve",
    whyChoose: "Why Choose EvalScol?",
    features: "Key Features",
    techStack: "Technical Architecture",
    frontend: "Frontend",
    backend: "Backend",
    integrations: "Integrations",
    security: "Security",
    presence: "Presence in Africa",
    languages: "Supported languages",
    languagesList: "French, English, Wolof, Bambara, Ewe, Yoruba",
    support: "Support and Assistance",
    phone: "Phone / WhatsApp",
    hours: "Mon-Fri: 8am-6pm GMT",
    email: "Email",
    responseTime: "Response Time",
    standard: "Standard: 24-48h",
    professional: "Professional: 12h",
    enterprise: "Enterprise: 4h (24/7)",
    cta: "Transform Your School Today",
    ctaDesc: "Join the institutions that trust EvalScol to digitize their school management in Africa.",
    viewPricing: "View Pricing",
    freeTrial: "14-Day Free Trial",
    contactTeam: "Contact the Team",
    noCreditCard: "No credit card required • Support in English & French • Training included"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {texts.back}
            </Button>
            <LanguageSwitcher />
          </div>
          
          <div className="text-center">
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-32 w-auto mx-auto mb-6"
            />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {texts.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {texts.subtitle}
            </p>
          </div>
        </header>

        {/* What is EvalScol */}
        <section className="mb-16">
          <Card className="border-primary/20">
            <CardContent className="pt-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4">{texts.whatIs}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    {texts.whatIsDesc1}
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {texts.whatIsDesc2}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Problems Solved */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{texts.problems}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, idx) => (
              <Card key={idx} className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg shrink-0">
                      <problem.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{problem.title}</h3>
                      <p className="text-muted-foreground">{problem.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Advantages */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{texts.whyChoose}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, idx) => (
              <Card key={idx} className="border-border hover:border-primary/40 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <advantage.icon className={`h-7 w-7 ${advantage.color} shrink-0`} />
                    <h3 className="font-semibold text-lg">{advantage.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{texts.features}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((section, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    {section.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{texts.techStack}</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-primary">{texts.frontend}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• React 18</li>
                    <li>• TypeScript</li>
                    <li>• Vite</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">{texts.backend}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Supabase</li>
                    <li>• PostgreSQL</li>
                    <li>• Edge Functions</li>
                    <li>• Row Level Security</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">{texts.integrations}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Paystack</li>
                    <li>• Lovable AI</li>
                    <li>• 11Labs Voice</li>
                    <li>• Google Cloud</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">{texts.security}</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• SSL/TLS</li>
                    <li>• RGPD compliant</li>
                    <li>• Sauvegardes 24h</li>
                    <li>• Audit logs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Coverage */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{texts.presence}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-5xl mb-3">{office.flag}</div>
                  <h3 className="font-semibold text-lg mb-2">{office.country}</h3>
                  <p className="text-muted-foreground mb-3 flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {office.city}
                  </p>
                  <Badge className={office.color}>{office.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6 bg-accent/5 border-accent/30">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                <strong>{texts.languages} :</strong> {texts.languagesList}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Support & Contact */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{texts.support}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Phone className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">{texts.phone}</h3>
                <p className="text-muted-foreground mb-2">+225 01 01 82 13 29 / 07 07 04 19 03</p>
                <p className="text-xs text-muted-foreground">{texts.hours}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Mail className="h-10 w-10 mx-auto text-accent mb-3" />
                <h3 className="font-semibold mb-2">{texts.email}</h3>
                <p className="text-muted-foreground mb-1">evalscolafrica@siteteck.com</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">{texts.responseTime}</h3>
                <p className="text-xs text-muted-foreground">{texts.standard}</p>
                <p className="text-xs text-muted-foreground">{texts.professional}</p>
                <p className="text-xs text-muted-foreground">{texts.enterprise}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{texts.cta}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {texts.ctaDesc}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/pricing")}>
                {texts.viewPricing}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                {texts.freeTrial}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/support")}>
                {texts.contactTeam}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              {texts.noCreditCard}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
