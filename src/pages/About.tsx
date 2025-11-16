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

export default function About() {
  const navigate = useNavigate();

  const problems = [
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
  ];

  const advantages = [
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
  ];

  const keyFeatures = [
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
  ];

  const offices = [
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="mb-16">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <div className="text-center">
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-24 w-auto mx-auto mb-6"
            />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              À Propos d'EvalScol Africa
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              La plateforme SaaS complète de gestion scolaire pour l'Afrique francophone
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
                  <h2 className="text-3xl font-bold mb-4">Qu'est-ce qu'EvalScol Africa ?</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                    EvalScol Africa est une <strong>plateforme SaaS (Software as a Service) complète de gestion scolaire</strong> spécialement 
                    conçue pour les établissements éducatifs en Afrique francophone. Solution 100% cloud, elle transforme radicalement
                    la gestion administrative, pédagogique et financière des écoles en automatisant l'ensemble des processus éducatifs.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Notre mission est de <strong>digitaliser l'éducation en Afrique</strong> en offrant aux écoles une solution moderne, 
                    accessible, économique et adaptée à leurs réalités locales. De la petite école primaire au grand groupe scolaire, 
                    EvalScol accompagne tous les établissements dans leur transformation numérique.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Problems Solved */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Les Problèmes que Nous Résolvons</h2>
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
          <h2 className="text-3xl font-bold mb-8 text-center">Pourquoi Choisir EvalScol ?</h2>
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
          <h2 className="text-3xl font-bold mb-8 text-center">Fonctionnalités Principales</h2>
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
          <h2 className="text-3xl font-bold mb-8 text-center">Architecture Technique</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Frontend</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• React 18</li>
                    <li>• TypeScript</li>
                    <li>• Vite</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Backend</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Supabase</li>
                    <li>• PostgreSQL</li>
                    <li>• Edge Functions</li>
                    <li>• Row Level Security</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Intégrations</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Paystack</li>
                    <li>• Lovable AI</li>
                    <li>• 11Labs Voice</li>
                    <li>• Google Cloud</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 text-primary">Sécurité</h3>
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
          <h2 className="text-3xl font-bold mb-8 text-center">Présence en Afrique</h2>
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
                <strong>Langues supportées :</strong> Français, Anglais, Wolof, Bambara, Ewe, Yoruba
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Support & Contact */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Support et Accompagnement</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Phone className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">Téléphone / WhatsApp</h3>
                <p className="text-muted-foreground mb-2">+225 07 07 04 19 04</p>
                <p className="text-xs text-muted-foreground">Lun-Ven: 8h-18h GMT</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Mail className="h-10 w-10 mx-auto text-accent mb-3" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground mb-1">support@evalscol.com</p>
                <p className="text-muted-foreground text-sm">contact@evalscol.com</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold mb-2">Délai de Réponse</h3>
                <p className="text-xs text-muted-foreground">Standard: 24-48h</p>
                <p className="text-xs text-muted-foreground">Professional: 12h</p>
                <p className="text-xs text-muted-foreground">Enterprise: 4h (24/7)</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Transformez Votre École Aujourd'hui</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez les établissements qui font confiance à EvalScol pour digitaliser 
              leur gestion scolaire en Afrique.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/pricing")}>
                Voir les Tarifs
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Essai Gratuit 14 Jours
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/support")}>
                Contacter l'Équipe
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Pas de carte bancaire requise • Support en français • Formation incluse
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
