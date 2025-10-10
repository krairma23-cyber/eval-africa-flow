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
  TrendingUp
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logError } from "@/lib/logger";

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
  const { toast } = useToast();

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
        console.error('Plans error:', plansError);
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

      // If no plans from DB, use default plans
      const defaultPlans: SubscriptionPlan[] = [
        {
          id: 'professional',
          name: 'Professional',
          price_monthly: 15000,
          price_yearly: 150000,
          features: [
            'Jusqu\'à 300 élèves',
            'Évaluations illimitées',
            'Analytics prédictifs',
            'Assistant vocal',
            'Rapports avancés',
            'Support prioritaire'
          ],
          searches_limit: 1000,
          api_calls_limit: 10000,
          is_popular: true
        },
        {
          id: 'enterprise',
          name: 'Entreprise',
          price_monthly: 30000,
          price_yearly: 300000,
          features: [
            'Plus de 300 élèves',
            'Tout du Professional',
            'Personnalisation complète',
            'Intégrations API',
            'Formation dédiée',
            'SLA et support premium',
            'Modules avancés'
          ],
          searches_limit: 10000,
          api_calls_limit: 100000,
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer un paiement",
          variant: "destructive",
        });
        return;
      }

      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) {
        throw new Error('Plan not found');
      }

      const amount = isYearly ? selectedPlan.price_yearly : selectedPlan.price_monthly;

      toast({
        title: "Initialisation du paiement",
        description: "Veuillez patienter...",
      });

      // Initialize payment with Paystack
      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          email: user.email,
          amount: amount, // Amount in FCFA
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          callback_url: `${window.location.origin}/dashboard/billing?payment=success`
        }
      });

      if (error) throw error;

      if (data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      }
    } catch (error) {
      await logError('Failed to upgrade plan', error, {
        component: 'Billing',
        action: 'UPGRADE_PLAN',
        metadata: { planId }
      });
      toast({
        title: "Erreur",
        description: "Impossible de traiter la mise à niveau",
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="plans">Plans & Tarifs</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
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

        <TabsContent value="plans" className="space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={!isYearly ? "font-medium" : "text-muted-foreground"}>Mensuel</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsYearly(!isYearly)}
              className="relative"
            >
              <div className={`absolute inset-0 bg-primary rounded-md transition-transform ${isYearly ? 'translate-x-full' : 'translate-x-0'}`} />
              <span className="relative z-10 px-3">
                {isYearly ? 'Annuel' : 'Mensuel'}
              </span>
            </Button>
            <span className={isYearly ? "font-medium" : "text-muted-foreground"}>
              Annuel <Badge variant="secondary" className="ml-2">-20%</Badge>
            </span>
          </div>

          {plans.length === 0 ? (
            <Card className="p-12">
              <CardContent className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Plans en cours de configuration</h3>
                  <p className="text-muted-foreground">
                    Les nouveaux plans d'abonnement seront bientôt disponibles.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.is_popular ? 'border-2 border-primary' : ''}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Le plus populaire
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {(isYearly ? plan.price_yearly : plan.price_monthly).toLocaleString('fr-FR')} FCFA
                      <span className="text-base font-normal text-muted-foreground">
                        /{isYearly ? 'an' : 'mois'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={currentPlan?.id === plan.id ? "outline" : "default"}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={currentPlan?.id === plan.id}
                    >
                      {currentPlan?.id === plan.id ? 'Plan actuel' : 'Choisir ce plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
      </Tabs>
    </div>
  );
}