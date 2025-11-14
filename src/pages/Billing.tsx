import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Crown, 
  Zap, 
  Check, 
  AlertCircle,
  Download,
  Calendar,
  TrendingUp,
  Star,
  Sparkles,
  Smartphone,
  Banknote
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logError } from "@/lib/logger";
import { PaymentPhoneDialog } from "@/components/forms/PaymentPhoneDialog";

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  searches_limit: number;
  api_calls_limit: number;
  is_popular: boolean;
}

interface UsageStats {
  searches_used: number;
  api_calls_used: number;
  current_plan: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  currency: string;
  status: string;
}

export default function Billing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const pricingPlans = [
    {
      id: 'free-trial',
      name: 'Gratuit (Essai)',
      description: 'Testez la plateforme pendant 14 jours',
      icon: Sparkles,
      iconColor: 'text-blue-500',
      price_monthly: 0,
      price_yearly: 0,
      badge: '14 jours d\'essai',
      badgeVariant: 'secondary' as const,
      popular: false,
      features: [
        '14 jours d\'essai gratuit',
        'Jusqu\'à 50 élèves maximum',
        'Toutes les fonctionnalités de base',
        'Gestion des notes et bulletins',
        'Portail parent',
        'Support communautaire',
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
      price_yearly: 299900,
      badge: null,
      badgeVariant: 'outline' as const,
      popular: false,
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
      price_yearly: 599900,
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
      price_yearly: 1499900,
      badge: 'Sur devis',
      badgeVariant: 'secondary' as const,
      popular: false,
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

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch subscription plans from Supabase
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (plansError) {
        await logError('Failed to fetch subscription plans', plansError, {
          component: 'Billing',
          action: 'FETCH_PLANS'
        });
      }

      const formattedPlans: SubscriptionPlan[] = (plansData || []).map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        price_monthly: parseFloat(plan.price_monthly),
        price_yearly: plan.price_yearly ? parseFloat(plan.price_yearly) : parseFloat(plan.price_monthly) * 10,
        features: Array.isArray(plan.features) ? plan.features : [],
        searches_limit: plan.searches_limit || 100,
        api_calls_limit: plan.api_calls_limit || 1000,
        is_popular: plan.is_popular || false
      }));

      setPlans(formattedPlans);

      // Get searches and api usage stats manually
      const { data: searchesData } = await supabase
        .from('ai_searches')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().setDate(1)).toISOString());

      const { data: apiUsageData } = await supabase
        .from('ai_usage_logs')
        .select('tokens_used')
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().setDate(1)).toISOString());

      const searchesUsed = searchesData?.length || 0;
      const apiCallsUsed = apiUsageData?.reduce((sum: number, log: any) => sum + (log.tokens_used || 0), 0) || 0;

      // If no plans from DB, use default plans based on knowledge base
      const defaultPlans: SubscriptionPlan[] = [
        {
          id: 'free-trial',
          name: 'Gratuit (Essai)',
          price_monthly: 0,
          price_yearly: 0,
          features: [
            '14 jours d\'essai gratuit',
            'Jusqu\'à 50 élèves maximum',
            'Toutes les fonctionnalités de base',
            'Gestion des notes et bulletins',
            'Portail parent',
            'Support communautaire',
            'Idéal pour tester la plateforme'
          ],
          searches_limit: 50,
          api_calls_limit: 100,
          is_popular: false
        },
        {
          id: 'standard',
          name: 'Standard',
          price_monthly: 29990,
          price_yearly: 299900,
          features: [
            'Jusqu\'à 300 élèves',
            'Gestion complète élèves & enseignants',
            'Évaluations et bulletins automatisés',
            'Portail parent avec accès temps réel',
            'Paiements Paystack intégrés',
            'Analytics de base',
            'Support email',
            'Idéal pour écoles primaires et petits collèges'
          ],
          searches_limit: 300,
          api_calls_limit: 3000,
          is_popular: false
        },
        {
          id: 'professional',
          name: 'Professional',
          price_monthly: 59990,
          price_yearly: 599900,
          features: [
            'Jusqu\'à 1000 élèves',
            'Toutes les fonctionnalités Standard',
            'AI Assistant (génération contenu pédagogique)',
            'Détection élèves à risque (IA)',
            'Analytics avancés avec prédictions',
            'Webhooks et API REST',
            'Support prioritaire (12h)',
            'Personnalisation logo/couleurs',
            'Idéal pour collèges et lycées moyens'
          ],
          searches_limit: 1000,
          api_calls_limit: 10000,
          is_popular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price_monthly: 149990,
          price_yearly: 1499900,
          features: [
            'Élèves illimités',
            'Toutes les fonctionnalités Professional',
            'Multi-établissements & multi-campus',
            'Intégrations personnalisées sur mesure',
            'Formation sur site incluse',
            'Support 24/7 avec SLA 99.9%',
            'Serveur dédié (option)',
            'Développements sur mesure',
            'Idéal pour groupes scolaires et réseaux'
          ],
          searches_limit: 999999,
          api_calls_limit: 999999,
          is_popular: false
        }
      ];

      const finalPlans = formattedPlans.length > 0 ? formattedPlans : defaultPlans;
      setPlans(finalPlans);

      setCurrentPlan(finalPlans[0] || defaultPlans[0]);

      setUsage({
        searches_used: searchesUsed,
        api_calls_used: apiCallsUsed,
        current_plan: finalPlans[0]?.name || 'Starter'
      });

      // Fetch user invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false })
        .limit(10);

      if (invoicesData) {
        setInvoices(invoicesData.map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          invoice_date: inv.invoice_date,
          amount: parseFloat(inv.amount),
          currency: inv.currency,
          status: inv.status
        })));
      }

    } catch (error) {
      await logError('Failed to fetch billing data', error, {
        component: 'Billing',
        action: 'FETCH_BILLING'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de facturation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    const amount = isYearly ? selectedPlan.price_yearly : selectedPlan.price_monthly;

    // Handle free plan without phone number
    if (amount === 0) {
      await processUpgrade(planId, null);
      return;
    }

    // For paid plans, ask for phone number first
    setPendingPlanId(planId);
    setPhoneDialogOpen(true);
  };

  const processUpgrade = async (planId: string, phoneNumber: string | null) => {
    try {
      console.log('🔄 Processing upgrade for plan:', planId);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        console.error('❌ No user email found');
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User found:', user.email);

      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) {
        console.error('❌ Plan not found:', planId);
        throw new Error('Plan not found');
      }

      console.log('✅ Selected plan:', selectedPlan.name);

      const amount = isYearly ? selectedPlan.price_yearly : selectedPlan.price_monthly;
      console.log('💰 Payment amount:', amount, 'FCFA');

      // Handle free plan (Starter)
      if (amount === 0) {
        console.log('🆓 Activating free plan');
        toast({
          title: "Activation du plan gratuit",
          description: "Activation en cours...",
        });

        const { data: activateData, error: activateError } = await supabase.functions.invoke('activate-subscription', {
          body: {
            user_id: user.id,
            plan_id: selectedPlan.id,
            billing_period: isYearly ? 'yearly' : 'monthly',
            payment_reference: null
          }
        });

        if (activateError || !activateData?.success) {
          console.error('❌ Subscription activation failed:', activateError);
          await logError('Subscription activation failed', activateError || new Error('Activation data invalid'), {
            component: 'Billing',
            action: 'ACTIVATE_SUBSCRIPTION'
          });
          throw new Error('Failed to activate subscription');
        }

        console.log('✅ Free plan activated successfully');
        setCurrentPlan(selectedPlan);
        
        toast({
          title: "Plan activé !",
          description: `Le plan ${selectedPlan.name} a été activé avec succès.`,
        });

        await fetchBillingData();
        return;
      }

      // Handle paid plans with phone number
      console.log('💳 Initializing Paystack payment...');
      console.log('📱 Phone number:', phoneNumber);
      
      toast({
        title: "Initialisation du paiement",
        description: "Connexion à Paystack...",
      });

      const paymentPayload = {
        email: user.email,
        amount: amount,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        phone_number: phoneNumber,
        callback_url: `${window.location.origin}/payment-callback`
      };

      console.log('📦 Payment payload:', paymentPayload);

      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: paymentPayload
      });

      console.log('📡 Paystack response:', { data, error });

      if (error) {
        console.error('❌ Paystack error:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ No data returned from Paystack');
        throw new Error('No data returned from payment gateway');
      }

      if (data.authorization_url) {
        console.log('✅ Authorization URL received:', data.authorization_url);
        
        const pendingPayment = {
          reference: data.reference,
          plan_id: selectedPlan.id,
          user_id: user.id,
          billing_period: isYearly ? 'yearly' : 'monthly'
        };

        console.log('💾 Storing pending payment:', pendingPayment);
        localStorage.setItem('pending_payment', JSON.stringify(pendingPayment));

        console.log('🔄 Redirecting to Paystack...');
        window.location.href = data.authorization_url;
      } else {
        console.error('❌ No authorization URL in response');
        throw new Error('No authorization URL received from payment gateway');
      }
    } catch (error) {
      console.error('❌ Payment process failed:', error);
      await logError('Failed to upgrade plan', error, {
        component: 'Billing',
        action: 'UPGRADE_PLAN',
        metadata: { planId }
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('💥 Error details:', errorMessage);
      
      toast({
        title: "Erreur de paiement",
        description: errorMessage.includes('authorization') || errorMessage.includes('gateway')
          ? "Impossible de se connecter à Paystack. Vérifiez votre clé API." 
          : "Impossible de traiter le paiement. Réessayez plus tard.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturation & Abonnements</h1>
          <p className="text-muted-foreground">
            Gérez votre plan d'abonnement et suivez votre utilisation
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard/paystack-diagnostic')}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Diagnostic Paystack
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              toast({
                title: "Téléchargement en cours",
                description: "L'archive de vos factures sera bientôt disponible",
              });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger factures
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="pricing">Tarification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Plan Actuel: {currentPlan?.name}</CardTitle>
                    <CardDescription>
                      {currentPlan?.price_monthly.toLocaleString('fr-FR')} FCFA/mois • Prochain paiement le 15 mars 2025
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Actif
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recherches</span>
                    <span className="text-sm font-medium">
                      {usage?.searches_used || 0} / {currentPlan?.searches_limit || 0}
                    </span>
                  </div>
                  <Progress 
                    value={((usage?.searches_used || 0) / (currentPlan?.searches_limit || 1)) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Appels API</span>
                    <span className="text-sm font-medium">
                      {usage?.api_calls_used || 0} / {currentPlan?.api_calls_limit || 0}
                    </span>
                  </div>
                  <Progress 
                    value={((usage?.api_calls_used || 0) / (currentPlan?.api_calls_limit || 1)) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm">Utilisation: +12% ce mois</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <CreditCard className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Méthode de paiement</h3>
                <p className="text-sm text-muted-foreground">•••• 1234</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    toast({
                      title: "Modification méthode de paiement",
                      description: "Cette fonctionnalité sera bientôt disponible",
                    });
                  }}
                >
                  Modifier
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Calendar className="h-8 w-8 mx-auto text-accent mb-2" />
                <h3 className="font-semibold">Prochaine facture</h3>
                <p className="text-sm text-muted-foreground">15 mars 2025</p>
                <p className="text-sm font-medium">{currentPlan?.price_monthly.toLocaleString('fr-FR')} FCFA</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <h3 className="font-semibold">Économies annuelles</h3>
                <p className="text-sm text-muted-foreground">Passez au plan annuel</p>
                <p className="text-sm font-medium text-green-600">-20%</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <AlertCircle className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <h3 className="font-semibold">Limite atteinte</h3>
                <p className="text-sm text-muted-foreground">Recherches: 85%</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    const professionalPlan = plans.find(p => p.name === 'Professional');
                    if (professionalPlan) {
                      handleUpgrade(professionalPlan.id);
                    }
                  }}
                >
                  Upgrader
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilisation des recherches</CardTitle>
                <CardDescription>30 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Utilisées</span>
                    <span className="font-medium">{usage?.searches_used || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Limite</span>
                    <span className="font-medium">{currentPlan?.searches_limit || 0}</span>
                  </div>
                  <Progress 
                    value={((usage?.searches_used || 0) / (currentPlan?.searches_limit || 1)) * 100} 
                  />
                  <p className="text-sm text-muted-foreground">
                    {currentPlan?.searches_limit ? (currentPlan.searches_limit - (usage?.searches_used || 0)) : 0} recherches restantes
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appels API</CardTitle>
                <CardDescription>30 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Utilisés</span>
                    <span className="font-medium">{usage?.api_calls_used || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Limite</span>
                    <span className="font-medium">{currentPlan?.api_calls_limit || 0}</span>
                  </div>
                  <Progress 
                    value={((usage?.api_calls_used || 0) / (currentPlan?.api_calls_limit || 1)) * 100} 
                  />
                  <p className="text-sm text-muted-foreground">
                    {currentPlan?.api_calls_limit ? (currentPlan.api_calls_limit - (usage?.api_calls_used || 0)) : 0} appels restants
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des factures</CardTitle>
              <CardDescription>Téléchargez vos factures précédentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.invoice_date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{invoice.amount.toLocaleString('fr-FR')} FCFA</p>
                          <Badge variant={invoice.status === 'paid' ? 'secondary' : 'outline'}>
                            {invoice.status === 'paid' ? 'Payée' : 
                             invoice.status === 'pending' ? 'En attente' : 
                             invoice.status === 'failed' ? 'Échouée' : 'Remboursée'}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Téléchargement",
                              description: `${invoice.invoice_number} sera bientôt disponible`,
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune facture disponible
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Plans de Tarification</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-6">
              Des plans adaptés à chaque taille d'établissement en Afrique francophone
            </p>

            {/* Toggle annuel/mensuel */}
            <div className="flex items-center justify-center gap-4">
              <span className={!isYearly ? "font-semibold" : "text-muted-foreground"}>Mensuel</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsYearly(!isYearly)}
                className="relative h-8 w-14"
              >
                <div className={`absolute inset-0.5 bg-primary rounded transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} style={{ width: '1.5rem' }} />
              </Button>
              <span className={isYearly ? "font-semibold" : "text-muted-foreground"}>
                Annuel
                <Badge variant="secondary" className="ml-2">-20%</Badge>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingPlans.map((plan) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.price_yearly : plan.price_monthly;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg' : 'border-border'}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Le plus populaire
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
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {price.toLocaleString('fr-FR')} <span className="text-base font-normal text-muted-foreground">FCFA</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {price === 0 ? 'Gratuit pendant 14 jours' : `par ${isYearly ? 'an' : 'mois'}`}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 mb-6">
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
                      size="sm"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={currentPlan?.id === plan.id}
                    >
                      {currentPlan?.id === plan.id ? 'Plan Actuel' : (price === 0 ? 'Essayer Gratuitement' : 'Payer avec Paystack')}
                    </Button>
                    
                    {price > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2 font-medium">Modes de paiement acceptés :</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Smartphone className="h-3 w-3 mr-1" />
                            Orange Money
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Smartphone className="h-3 w-3 mr-1" />
                            MTN Money
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Smartphone className="h-3 w-3 mr-1" />
                            Moov Money
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Banknote className="h-3 w-3 mr-1" />
                            Visa/Mastercard
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Options */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Options Supplémentaires</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalOptions.map((option, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-base">{option.title}</CardTitle>
                    <div className="text-xl font-bold text-primary">{option.price}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Toutes les Fonctionnalités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Gestion Administrative
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Gestion des élèves et inscriptions</li>
                    <li>• Gestion des enseignants</li>
                    <li>• Organisation des classes</li>
                    <li>• Emploi du temps</li>
                    <li>• Calendrier scolaire</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Évaluations & Bulletins
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Système d'évaluation avancé</li>
                    <li>• Coefficients personnalisables</li>
                    <li>• Bulletins PDF automatiques</li>
                    <li>• Classements et statistiques</li>
                    <li>• Rapports analytiques</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Communication & Parents
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Portail parent complet</li>
                    <li>• Accès temps réel aux notes</li>
                    <li>• Notifications automatiques</li>
                    <li>• Historique complet</li>
                    <li>• Multi-enfants support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Finances & Paiements
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Intégration Paystack complète</li>
                    <li>• Mobile money (Orange, MTN, Moov)</li>
                    <li>• Suivi des paiements</li>
                    <li>• Reçus automatiques PDF</li>
                    <li>• Tableau de bord financier</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Intelligence Artificielle
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Génération de contenu pédagogique</li>
                    <li>• Détection élèves à risque</li>
                    <li>• Analyses prédictives</li>
                    <li>• Recommandations IA</li>
                    <li>• Assistant vocal (Pro+)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent" />
                    Sécurité & Support
                  </h4>
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
        </TabsContent>
      </Tabs>

      <PaymentPhoneDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        onConfirm={(phone) => {
          console.log('📱 Phone confirmed:', phone);
          setPhoneDialogOpen(false);
          if (pendingPlanId) {
            console.log('⏳ Processing payment with phone number...');
            processUpgrade(pendingPlanId, phone);
            setPendingPlanId(null);
          } else {
            console.error('❌ No pending plan ID found');
          }
        }}
        planName={plans.find(p => p.id === pendingPlanId)?.name || ""}
        amount={
          pendingPlanId 
            ? (isYearly 
                ? plans.find(p => p.id === pendingPlanId)?.price_yearly 
                : plans.find(p => p.id === pendingPlanId)?.price_monthly) || 0
            : 0
        }
      />
    </div>
  );
}