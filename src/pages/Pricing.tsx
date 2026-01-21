import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Star, Zap, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const { t } = useLanguage();

  const plans = [
    {
      id: 'free-trial',
      name: 'Gratuit (Essai)',
      description: 'Testez la plateforme pendant 14 jours',
      icon: Sparkles,
      iconColor: 'text-blue-500',
      price_monthly: 0,
      badge: '14 jours d\'essai',
      badgeVariant: 'secondary' as const,
      features: [
        '14 jours d\'essai gratuit',
        'Jusqu\'à 50 élèves maximum',
        'Toutes les fonctionnalités de base',
        'Gestion des notes et bulletins',
        'Portail parent',
        'Support communautaire',
        'Idéal pour tester la plateforme'
      ],
      ideal: 'Idéal pour : Test de la plateforme, petites écoles pilotes'
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Pour les écoles primaires et petits collèges',
      icon: Check,
      iconColor: 'text-green-500',
      price_monthly: 29990,
      badge: null,
      badgeVariant: 'outline' as const,
      features: [
        'Jusqu\'à 300 élèves',
        'Gestion complète élèves & enseignants',
        'Évaluations et bulletins automatisés',
        'Portail parent avec accès temps réel',
        'Paiements Paystack intégrés',
        'Analytics de base',
        'Support email'
      ],
      ideal: 'Idéal pour : Écoles primaires, petits collèges'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Pour les collèges et lycées moyens',
      icon: Star,
      iconColor: 'text-yellow-500',
      price_monthly: 59990,
      badge: 'Le plus populaire',
      badgeVariant: 'default' as const,
      popular: true,
      features: [
        'Jusqu\'à 1000 élèves',
        'Toutes les fonctionnalités Standard',
        'AI Assistant (génération contenu pédagogique)',
        'Détection élèves à risque (IA)',
        'Analytics avancés avec prédictions',
        'Webhooks et API REST',
        'Support prioritaire (12h)',
        'Personnalisation logo/couleurs'
      ],
      ideal: 'Idéal pour : Collèges, lycées moyens'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Pour les groupes scolaires et réseaux',
      icon: Crown,
      iconColor: 'text-purple-500',
      price_monthly: 149990,
      badge: 'Sur devis',
      badgeVariant: 'secondary' as const,
      features: [
        'Élèves illimités',
        'Toutes les fonctionnalités Professional',
        'Multi-établissements & multi-campus',
        'Intégrations personnalisées sur mesure',
        'Formation sur site incluse',
        'Support 24/7 avec SLA 99.9%',
        'Serveur dédié (option)',
        'Développements sur mesure'
      ],
      ideal: 'Idéal pour : Groupes scolaires, réseaux d\'écoles'
    }
  ];

  // Calcul automatique du prix annuel avec 20% de réduction
  const getPrice = (plan: typeof plans[0]) => {
    if (plan.price_monthly === 0) return 0;
    if (isYearly) {
      return Math.round(plan.price_monthly * 12 * 0.8); // 12 mois - 20%
    }
    return plan.price_monthly;
  };

  const getMonthlyEquivalent = (plan: typeof plans[0]) => {
    if (plan.price_monthly === 0) return 0;
    return Math.round(plan.price_monthly * 0.8); // Prix mensuel équivalent avec réduction
  };

  const additionalOptions = [
    {
      title: 'Formation initiale',
      price: '50 000 FCFA',
      description: '1 journée complète sur site pour l\'équipe administrative'
    },
    {
      title: 'Formation continue',
      price: '25 000 FCFA/session',
      description: 'Sessions dédiées aux enseignants et à la saisie de notes'
    },
    {
      title: 'Migration données',
      price: '100 000 - 500 000 FCFA',
      description: 'Migration de vos données existantes selon volume'
    },
    {
      title: 'Personnalisation avancée',
      price: 'Sur devis',
      description: 'Développements sur mesure selon vos besoins spécifiques'
    },
    {
      title: 'Stockage additionnel',
      price: '5 000 FCFA/10GB/mois',
      description: 'Espace de stockage supplémentaire pour documents et médias'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('pricing.back')}
            </Button>
            <LanguageSwitcher />
          </div>
          
          <div className="text-center">
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('pricing.subtitle')}
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={!isYearly ? "font-semibold" : "text-muted-foreground"}>{t('pricing.monthly')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsYearly(!isYearly)}
                className="relative h-8 w-14"
              >
                <div className={`absolute inset-0.5 bg-primary rounded transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} style={{ width: '1.5rem' }} />
              </Button>
              <span className={isYearly ? "font-semibold" : "text-muted-foreground"}>
                {t('pricing.yearly')}
                <Badge variant="secondary" className="ml-2">-20%</Badge>
              </span>
            </div>
          </div>
        </header>

        {/* Plans Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const monthlyEquivalent = getMonthlyEquivalent(plan);
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      {t('pricing.popular')}
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-background`}>
                      <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                    </div>
                    {plan.badge && (
                      <Badge variant={plan.badgeVariant}>{plan.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      {price.toLocaleString('fr-FR')} <span className="text-lg font-normal text-muted-foreground">FCFA</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {price === 0 ? t('pricing.freeFor14Days') : `${t('pricing.perMonth').replace('mois', isYearly ? t('pricing.perYear').replace('par ', '') : t('pricing.perMonth').replace('par ', ''))}`}
                    </div>
                    {isYearly && plan.price_monthly > 0 && (
                      <div className="mt-1 text-xs text-primary">
                        {t('pricing.equivalent')} {monthlyEquivalent.toLocaleString('fr-FR')} FCFA/{t('pricing.monthly').toLowerCase()} ({t('pricing.savings')})
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="p-3 bg-accent/10 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">{plan.ideal}</p>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    {price === 0 ? t('pricing.cta.trial') : t('pricing.cta.choose')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Additional Options */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('pricing.additionalOptions')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalOptions.map((option, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <div className="text-2xl font-bold text-primary">{option.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Comparison */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('pricing.allFeatures')}</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Gestion Administrative
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Gestion des élèves et inscriptions</li>
                    <li>• Gestion des enseignants</li>
                    <li>• Organisation des classes</li>
                    <li>• Emploi du temps</li>
                    <li>• Calendrier scolaire</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Évaluations & Bulletins
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Système d'évaluation avancé</li>
                    <li>• Coefficients personnalisables</li>
                    <li>• Bulletins PDF automatiques</li>
                    <li>• Classements et statistiques</li>
                    <li>• Rapports analytiques</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Communication & Parents
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Portail parent complet</li>
                    <li>• Accès temps réel aux notes</li>
                    <li>• Notifications automatiques</li>
                    <li>• Historique complet</li>
                    <li>• Multi-enfants support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Finances & Paiements
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Intégration Paystack complète</li>
                    <li>• Mobile money (Orange, MTN, Moov)</li>
                    <li>• Suivi des paiements</li>
                    <li>• Reçus automatiques PDF</li>
                    <li>• Tableau de bord financier</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Intelligence Artificielle
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Génération de contenu pédagogique</li>
                    <li>• Détection élèves à risque</li>
                    <li>• Analyses prédictives</li>
                    <li>• Recommandations IA</li>
                    <li>• Assistant vocal (Pro+)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Sécurité & Support
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Chiffrement SSL/TLS</li>
                    <li>• Sauvegardes automatiques</li>
                    <li>• Conformité RGPD</li>
                    <li>• Audit logs complets</li>
                    <li>• Support multilingue</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">{t('pricing.faq')}</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq.changePlan')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.faq.changePlanAnswer')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq.afterTrial')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.faq.afterTrialAnswer')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq.howPayments')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.faq.howPaymentsAnswer')}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('pricing.faq.whatSupport')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.faq.whatSupportAnswer')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('pricing.ready')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('pricing.readyDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                {t('pricing.startTrial')}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/support")}>
                {t('pricing.contactSales')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              {t('pricing.noCard')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
