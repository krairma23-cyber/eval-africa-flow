import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  BookOpen
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
import { Label } from "@/components/ui/label";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
  usage_count: number;
  is_active: boolean;
}

export default function ApiManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      // Simulate API keys data
      const mockApiKeys: ApiKey[] = [
        {
          id: '1',
          name: 'Production API',
          key: 'eval_pk_live_1234567890abcdef',
          created_at: '2024-01-15',
          last_used: '2024-02-20',
          usage_count: 1250,
          is_active: true
        },
        {
          id: '2',
          name: 'Development API',
          key: 'eval_pk_test_9876543210fedcba',
          created_at: '2024-02-01',
          last_used: '2024-02-19',
          usage_count: 486,
          is_active: true
        }
      ];
      setApiKeys(mockApiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
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
    if (!newKeyName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour la clé API",
        variant: "destructive",
      });
      return;
    }

    try {
      const newKey = `eval_pk_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
      const apiKey: ApiKey = {
        id: String(Date.now()),
        name: newKeyName,
        key: newKey,
        created_at: new Date().toISOString().split('T')[0],
        last_used: null,
        usage_count: 0,
        is_active: true
      };

      setApiKeys([...apiKeys, apiKey]);
      setNewKeyName("");
      
      toast({
        title: "Clé API créée",
        description: "Votre nouvelle clé API a été générée avec succès",
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la clé API",
        variant: "destructive",
      });
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast({
        title: "Clé API supprimée",
        description: "La clé API a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
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
    return key.slice(0, 12) + '•'.repeat(key.length - 16) + key.slice(-4);
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
                            {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                          </code>
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
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Créée le {new Date(apiKey.created_at).toLocaleDateString('fr-FR')} • 
                          {apiKey.usage_count} utilisations • 
                          Dernière utilisation: {apiKey.last_used ? new Date(apiKey.last_used).toLocaleDateString('fr-FR') : 'Jamais'}
                        </p>
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
                    <span className="font-bold text-2xl">1,736</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taux de succès</span>
                    <span className="font-medium text-green-600">99.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Temps de réponse moyen</span>
                    <span className="font-medium">145ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Endpoints populaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <code className="text-sm">/api/students</code>
                    <span className="text-sm text-muted-foreground">682 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-sm">/api/assessments</code>
                    <span className="text-sm text-muted-foreground">451 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-sm">/api/reports</code>
                    <span className="text-sm text-muted-foreground">298 requêtes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-sm">/api/analytics</code>
                    <span className="text-sm text-muted-foreground">305 requêtes</span>
                  </div>
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
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Recevez des notifications en temps réel via webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Webhooks non configurés</h3>
                <p className="text-muted-foreground mb-4">
                  Configurez des webhooks pour recevoir des notifications automatiques
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Configurer webhook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}