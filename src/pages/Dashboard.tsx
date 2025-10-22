import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, ClipboardCheck, Brain, Zap, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { PredictiveAnalytics } from "@/components/analytics/PredictiveAnalytics";
import { ContentGenerator } from "@/components/ai/ContentGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { logError } from "@/lib/logger";

interface DashboardStats {
  studentsCount: number;
  teachersCount: number;
  subjectsCount: number;
  assessmentsCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [studentsResponse, teachersResponse, subjectsResponse, assessmentsResponse] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('assessments').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        studentsCount: studentsResponse.count || 0,
        teachersCount: teachersResponse.count || 0,
        subjectsCount: subjectsResponse.count || 0,
        assessmentsCount: assessmentsResponse.count || 0,
      });
    } catch (error) {
      await logError('Failed to fetch dashboard stats', error, {
        component: 'Dashboard',
        action: 'FETCH_STATS'
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Élèves",
      value: stats?.studentsCount || 0,
      description: "Élèves inscrits",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Enseignants",
      value: stats?.teachersCount || 0,
      description: "Enseignants actifs",
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      title: "Matières",
      value: stats?.subjectsCount || 0,
      description: "Matières enseignées",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Évaluations",
      value: stats?.assessmentsCount || 0,
      description: "Évaluations créées",
      icon: ClipboardCheck,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg blur-3xl" />
        <div className="relative p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-accent">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EvalScol IA
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Plateforme d'évaluation révolutionnaire alimentée par l'IA
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Assistant IA
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analytics IA
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Génération IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                      <card.icon className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-16" /> : card.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <AIAssistant />
            
            <Card className="border-accent/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  IA en Action
                </CardTitle>
                <CardDescription>
                  Fonctionnalités alimentées par l'intelligence artificielle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm">Analyse prédictive des performances</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm">Génération automatique d'évaluations</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-sm">Recommandations pédagogiques</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-sm">Détection précoce des difficultés</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Innovations EvalScol
                </CardTitle>
                <CardDescription>
                  Ce qui nous différencie de la concurrence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">🎙️ Assistant vocal IA</div>
                  <div className="text-xs text-muted-foreground">Créez des évaluations par la voix</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">🔮 Analytics prédictifs</div>
                  <div className="text-xs text-muted-foreground">Anticipez les difficultés des élèves</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">⚡ Génération automatique</div>
                  <div className="text-xs text-muted-foreground">Contenu pédagogique instantané</div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">🧠 Apprentissage adaptatif</div>
                  <div className="text-xs text-muted-foreground">IA qui s'améliore avec l'usage</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <div className="grid gap-6 md:grid-cols-2">
            <AIAssistant />
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Guide d'utilisation</CardTitle>
                <CardDescription>Comment tirer le meilleur parti de votre assistant IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">🎤 Commandes vocales</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• "Créer une évaluation de mathématiques niveau 5ème"</li>
                    <li>• "Analyser les performances de Pierre Martin"</li>
                    <li>• "Générer un rapport pour la classe de 3ème A"</li>
                    <li>• "Quelles sont les prédictions pour ce trimestre ?"</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">🤖 Capacités IA</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• Compréhension du langage naturel</li>
                    <li>• Génération de contenu pédagogique</li>
                    <li>• Analyse prédictive des performances</li>
                    <li>• Recommandations personnalisées</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="generator">
          <ContentGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}