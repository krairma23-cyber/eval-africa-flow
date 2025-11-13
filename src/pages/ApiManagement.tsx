import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2,
  Activity,
  Globe,
  Code,
  BookOpen,
  Power,
  PowerOff
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddWebhookDialog from "@/components/forms/AddWebhookDialog";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
  is_active: boolean;
  full_key?: string; // Only available immediately after creation
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  last_triggered_at: string | null;
  success_count: number;
  failure_count: number;
}

interface ApiStats {
  total_requests: number;
  success_rate: number;
  avg_response_time: number;
}

interface EndpointStat {
  endpoint: string;
  count: number;
}

export default function ApiManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiStats, setApiStats] = useState<ApiStats>({ total_requests: 0, success_rate: 0, avg_response_time: 0 });
  const [endpointStats, setEndpointStats] = useState<EndpointStat[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
    fetchWebhooks();
    fetchApiStats();
    fetchEndpointStats();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      // Get user's school_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.school_id) {
        toast({
          title: "Erreur",
          description: "Profil utilisateur non trouvé",
          variant: "destructive",
        });
        return;
      }

      // Fetch API keys
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApiKeys(data || []);
    } catch (error) {
      const { logError } = await import('@/lib/logger');
      await logError('Failed to fetch API keys', error, {
        component: 'ApiManagement',
        action: 'FETCH_API_KEYS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les clés API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim() || newKeyName.trim().length < 3) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom valide (min 3 caractères)",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call secure edge function to generate the API key
      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: { name: newKeyName.trim() }
      });

      if (error) {
        const message = error.message || 'Une erreur s\'est produite';
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
        return;
      }

      if (!data || !data.key) {
        toast({
          title: "Erreur",
          description: "Échec de la génération de la clé",
          variant: "destructive",
        });
        return;
      }

      // Add to local state with full key (only shown once)
      const newKeyData: ApiKey = {
        id: data.key_id,
        name: data.name,
        key_prefix: data.key_prefix,
        created_at: new Date().toISOString(),
        last_used_at: null,
        usage_count: 0,
        is_active: true,
        full_key: data.key
      };
      
      setApiKeys([newKeyData, ...apiKeys]);
      setNewKeyName("");
      
      toast({
        title: "Clé API créée",
        description: "Copiez cette clé maintenant, elle ne sera plus visible",
      });
    } catch (error) {
      const { logError } = await import('@/lib/logger');
      await logError('Failed to create API key', error, {
        component: 'ApiManagement',
        action: 'CREATE_API_KEY'
      });
      toast({
        title: "Erreur",
        description: "Impossible de créer la clé API",
        variant: "destructive",
      });
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast({
        title: "Clé API supprimée",
        description: "La clé API a été supprimée avec succès",
      });
    } catch (error) {
      const { logError } = await import('@/lib/logger');
      await logError('Failed to delete API key', error, {
        component: 'ApiManagement',
        action: 'DELETE_API_KEY',
        metadata: { keyId }
      });
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la clé API",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "La clé API a été copiée dans le presse-papiers",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 16) return key;
    return key.slice(0, 12) + '•'.repeat(20) + key.slice(-4);
  };

  const getDisplayKey = (apiKey: ApiKey) => {
    // If full_key is available (just created), return it or masked version
    if (apiKey.full_key) {
      return showKeys[apiKey.id] ? apiKey.full_key : maskApiKey(apiKey.full_key);
    }
    // Otherwise show prefix with dots
    return apiKey.key_prefix + '••••••••••••••••••••••••';
  };

  const fetchWebhooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.school_id) return;

      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      // Webhook fetch failed - handled by empty state
    }
  };

  const fetchApiStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get API usage from comprehensive_audit_logs for last 30 days
      const { data: logs, error } = await supabase
        .from("comprehensive_audit_logs")
        .select("success, execution_time_ms")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq("user_id", user.id);

      if (error) throw error;

      if (logs && logs.length > 0) {
        const total = logs.length;
        const successful = logs.filter(l => l.success).length;
        const avgTime = logs
          .filter(l => l.execution_time_ms != null)
          .reduce((sum, l) => sum + (l.execution_time_ms || 0), 0) / logs.filter(l => l.execution_time_ms != null).length;

        setApiStats({
          total_requests: total,
          success_rate: (successful / total) * 100,
          avg_response_time: Math.round(avgTime || 0),
        });
      }
    } catch (error) {
      // API stats fetch failed - using default values
    }
  };

  const fetchEndpointStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: logs, error } = await supabase
        .from("comprehensive_audit_logs")
        .select("action")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq("user_id", user.id);

      if (error) throw error;

      if (logs) {
        // Count occurrences of each action
        const counts = logs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Convert to array and sort
        const sorted = Object.entries(counts)
          .map(([endpoint, count]) => ({ endpoint, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setEndpointStats(sorted);
      }
    } catch (error) {
      // Endpoint stats fetch failed - using empty array
    }
  };

  const toggleWebhookStatus = async (webhookId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("webhooks")
        .update({ is_active: !currentStatus })
        .eq("id", webhookId);

      if (error) throw error;

      setWebhooks(webhooks.map(w => 
        w.id === webhookId ? { ...w, is_active: !currentStatus } : w
      ));

      toast({
        title: "Statut modifié",
        description: `Le webhook a été ${!currentStatus ? "activé" : "désactivé"}`,
      });
    } catch (error) {
      const { logError } = await import('@/lib/logger');
      await logError('Failed to toggle webhook', error, {
        component: 'ApiManagement',
        action: 'TOGGLE_WEBHOOK',
        metadata: { webhookId }
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du webhook",
        variant: "destructive",
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from("webhooks")
        .delete()
        .eq("id", webhookId);

      if (error) throw error;

      setWebhooks(webhooks.filter(w => w.id !== webhookId));
      toast({
        title: "Webhook supprimé",
        description: "Le webhook a été supprimé avec succès",
      });
    } catch (error) {
      const { logError } = await import('@/lib/logger');
      await logError('Failed to delete webhook', error, {
        component: 'ApiManagement',
        action: 'DELETE_WEBHOOK',
        metadata: { webhookId }
      });
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le webhook",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des API</h1>
        <p className="text-muted-foreground">
          Gérez vos clés API et intégrations
        </p>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">Clés API</TabsTrigger>
          <TabsTrigger value="usage">Utilisation</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Create new API key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Créer une nouvelle clé API
              </CardTitle>
              <CardDescription>
                Les clés API permettent d'accéder à nos services de façon sécurisée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="key-name">Nom de la clé</Label>
                  <Input
                    id="key-name"
                    placeholder="Ex: Production API, Development..."
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={generateApiKey}>
                    <Key className="h-4 w-4 mr-2" />
                    Générer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>Clés API existantes</CardTitle>
              <CardDescription>
                Gérez vos clés API actives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Key className="h-5 w-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                            {apiKey.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {getDisplayKey(apiKey)}
                          </code>
                          {apiKey.full_key && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                              >
                                {showKeys[apiKey.id] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.full_key!)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Créée le {new Date(apiKey.created_at).toLocaleDateString('fr-FR')} • 
                          {apiKey.usage_count} utilisations • 
                          Dernière utilisation: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString('fr-FR') : 'Jamais'}
                        </p>
                        {apiKey.full_key && (
                          <p className="text-sm text-orange-600 mt-1">
                            ⚠️ Copiez cette clé maintenant, elle ne sera plus visible après actualisation
                          </p>
                        )}
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la clé API</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cette clé API ne pourra plus être utilisée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteApiKey(apiKey.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Utilisation API
                </CardTitle>
                <CardDescription>30 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Requêtes totales</span>
                    <span className="font-bold text-2xl">{apiStats.total_requests.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taux de succès</span>
                    <span className="font-medium text-green-600">{apiStats.success_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Temps de réponse moyen</span>
                    <span className="font-medium">{apiStats.avg_response_time}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Actions populaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endpointStats.length > 0 ? (
                    endpointStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <code className="text-sm">{stat.endpoint}</code>
                        <span className="text-sm text-muted-foreground">{stat.count} requêtes</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Documentation API
              </CardTitle>
              <CardDescription>
                Guide complet pour intégrer nos API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Authentification</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Utilisez votre clé API dans l'en-tête Authorization:
                  </p>
                  <code className="block p-3 bg-muted rounded text-sm">
                    curl -H "Authorization: Bearer YOUR_API_KEY" https://api.evalscol.com/v1/students
                  </code>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Endpoints principaux</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">GET</Badge>
                      <code>/api/v1/students</code>
                      <span className="text-muted-foreground">Liste des élèves</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">POST</Badge>
                      <code>/api/v1/students</code>
                      <span className="text-muted-foreground">Créer un élève</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">GET</Badge>
                      <code>/api/v1/assessments</code>
                      <span className="text-muted-foreground">Liste des évaluations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">POST</Badge>
                      <code>/api/v1/reports/generate</code>
                      <span className="text-muted-foreground">Générer un rapport</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Limites de taux</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 1000 requêtes par heure pour les clés de test</li>
                    <li>• 10000 requêtes par heure pour les clés de production</li>
                    <li>• En cas de dépassement, retour HTTP 429</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <a href="#" target="_blank">
                    <Code className="h-4 w-4 mr-2" />
                    Documentation complète
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#" target="_blank">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Exemples de code
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>
                    Recevez des notifications en temps réel via webhooks
                  </CardDescription>
                </div>
                <AddWebhookDialog onSuccess={fetchWebhooks} />
              </div>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucun webhook configuré</h3>
                  <p className="text-muted-foreground mb-4">
                    Configurez des webhooks pour recevoir des notifications automatiques
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{webhook.name}</h3>
                          <Badge variant={webhook.is_active ? "default" : "secondary"}>
                            {webhook.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{webhook.url}</p>
                        <div className="flex gap-2 flex-wrap">
                          {webhook.events.map((event, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {webhook.success_count} succès • {webhook.failure_count} échecs
                          {webhook.last_triggered_at && (
                            <> • Dernier: {new Date(webhook.last_triggered_at).toLocaleDateString('fr-FR')}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWebhookStatus(webhook.id, webhook.is_active)}
                        >
                          {webhook.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le webhook</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. Le webhook ne recevra plus de notifications.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteWebhook(webhook.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}