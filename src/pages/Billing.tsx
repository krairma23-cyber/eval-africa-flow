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

export default function Billing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Simulate subscription plans data
      const mockPlans: SubscriptionPlan[] = [
        {
          id: '1',
          name: 'Starter',
          price_monthly: 29,
          price_yearly: 290,
          features: ['100 évaluations/mois', 'Support email', 'Analytics de base'],
          searches_limit: 1000,
          api_calls_limit: 5000,
          is_popular: false
        },
        {
          id: '2',
          name: 'Professional',
          price_monthly: 59,
          price_yearly: 590,
          features: ['Évaluations illimitées', 'Support prioritaire', 'Analytics avancées', 'API complète'],
          searches_limit: 5000,
          api_calls_limit: 25000,
          is_popular: true
        }
      ];

      setPlans(mockPlans);
      setCurrentPlan(mockPlans[0]);

      // Simulate usage data
      setUsage({
        searches_used: 85,
        api_calls_used: 1240,
        current_plan: 'starter'
      });
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
      toast({
        title: "Redirection vers le paiement",
        description: "Vous allez être redirigé vers notre plateforme de paiement sécurisée",
      });
      // Redirect to payment processor
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
        <Button variant="outline">
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
                      {currentPlan?.price_monthly}€/mois • Prochain paiement le 15 mars 2024
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
                <Button variant="outline" size="sm" className="mt-2">
                  Modifier
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Calendar className="h-8 w-8 mx-auto text-accent mb-2" />
                <h3 className="font-semibold">Prochaine facture</h3>
                <p className="text-sm text-muted-foreground">15 mars 2024</p>
                <p className="text-sm font-medium">{currentPlan?.price_monthly}€</p>
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
                <Button variant="outline" size="sm" className="mt-2">
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
                    {isYearly ? plan.price_yearly : plan.price_monthly}€
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
                {[
                  { id: '001', date: '15 févr. 2024', amount: '29€', status: 'Payée' },
                  { id: '002', date: '15 janv. 2024', amount: '29€', status: 'Payée' },
                  { id: '003', date: '15 déc. 2023', amount: '29€', status: 'Payée' },
                ].map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Facture #{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant="secondary">{invoice.status}</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}