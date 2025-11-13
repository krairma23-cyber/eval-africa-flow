import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: string;
  topFeatures: Array<{ name: string; usage: number; change: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  featureUsage: Array<{ feature: string; count: number; percentage: number }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      
      // Simulate analytics data
      const mockData: AnalyticsData = {
        totalUsers: 1247,
        activeUsers: 892,
        totalSessions: 3456,
        avgSessionDuration: "12m 34s",
        topFeatures: [
          { name: "Évaluations", usage: 2341, change: 12.5 },
          { name: "Bulletins", usage: 1876, change: 8.2 },
          { name: "Analytics IA", usage: 1543, change: 23.7 },
          { name: "Gestion élèves", usage: 1234, change: -2.1 },
          { name: "Assistant IA", usage: 987, change: 45.3 }
        ],
        userGrowth: [
          { date: "2025-01-01", users: 1100 },
          { date: "2025-01-15", users: 1156 },
          { date: "2025-02-01", users: 1203 },
          { date: "2025-02-15", users: 1247 }
        ],
        featureUsage: [
          { feature: "Dashboard", count: 3456, percentage: 89 },
          { feature: "Évaluations", count: 2341, percentage: 67 },
          { feature: "Bulletins", count: 1876, percentage: 54 },
          { feature: "Analytics", count: 1543, percentage: 43 },
          { feature: "Paramètres", count: 987, percentage: 28 }
        ]
      };

      setData(mockData);
    } catch (error) {
      // Analytics fetch failed - handled by loading state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportData = () => {
    // Simulate data export
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Feature,Usage,Change%\n"
      + data?.topFeatures.map(f => `${f.name},${f.usage},${f.change}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Rapports</h1>
          <p className="text-muted-foreground">
            Analysez l'utilisation et les performances de votre plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            onClick={() => {
              exportData();
              toast({
                title: "Export réussi",
                description: `Les données analytiques (${timeRange}) ont été exportées en CSV`,
              });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                  +12% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((data?.activeUsers || 0) / (data?.totalUsers || 1) * 100)}% du total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions totales</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.totalSessions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                  +8% cette semaine
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Durée moyenne</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.avgSessionDuration}</div>
                <p className="text-xs text-muted-foreground">
                  +2m 15s vs mois dernier
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Fonctionnalités les plus utilisées
              </CardTitle>
              <CardDescription>
                Classement des fonctionnalités par utilisation ({timeRange})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.topFeatures.map((feature, index) => (
                  <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.usage.toLocaleString()} utilisations
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={feature.change > 0 ? "default" : "secondary"}
                      className={feature.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {feature.change > 0 ? '+' : ''}{feature.change}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Croissance des utilisateurs</CardTitle>
                <CardDescription>Évolution du nombre d'utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.userGrowth.map((point, index) => (
                    <div key={point.date} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(point.date).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{point.users.toLocaleString()}</span>
                        {index > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            +{point.users - data.userGrowth[index - 1].users}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Types d'utilisateurs</CardTitle>
                <CardDescription>Répartition par rôle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Administrateurs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="w-1/6 bg-primary rounded-full h-2"></div>
                      </div>
                      <span className="text-sm font-medium">45</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Enseignants</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="w-2/3 bg-accent rounded-full h-2"></div>
                      </div>
                      <span className="text-sm font-medium">678</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Utilisateurs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div className="w-full bg-secondary rounded-full h-2"></div>
                      </div>
                      <span className="text-sm font-medium">524</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Utilisation des fonctionnalités</CardTitle>
              <CardDescription>
                Pourcentage d'utilisateurs ayant utilisé chaque fonctionnalité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.featureUsage.map((feature) => (
                  <div key={feature.feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {feature.count.toLocaleString()} utilisateurs
                        </span>
                        <span className="font-medium">{feature.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${feature.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance système</CardTitle>
                <CardDescription>Métriques de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Temps de réponse API</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Excellent
                      </Badge>
                      <span className="font-medium">145ms</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Disponibilité</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        99.9%
                      </Badge>
                      <span className="font-medium">Uptime</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Erreurs</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        0.1%
                      </Badge>
                      <span className="font-medium">Taux d'erreur</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation des ressources</CardTitle>
                <CardDescription>Charge système actuelle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>CPU</span>
                      <span className="font-medium">23%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="w-1/4 bg-primary rounded-full h-2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Mémoire</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="w-2/3 bg-accent rounded-full h-2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Stockage</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="w-1/2 bg-secondary rounded-full h-2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}