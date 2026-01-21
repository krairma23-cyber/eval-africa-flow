import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, ClipboardCheck, Brain, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { PredictiveAnalytics } from "@/components/analytics/PredictiveAnalytics";
import { ContentGenerator } from "@/components/ai/ContentGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { logError } from "@/lib/logger";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardStats {
  studentsCount: number;
  teachersCount: number;
  subjectsCount: number;
  assessmentsCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { planLimits, loading: planLoading } = usePlanLimits();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      title: t('dashboard.students'),
      value: stats?.studentsCount || 0,
      description: t('dashboard.students.desc'),
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: t('dashboard.teachers'),
      value: stats?.teachersCount || 0,
      description: t('dashboard.teachers.desc'),
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      title: t('dashboard.subjects'),
      value: stats?.subjectsCount || 0,
      description: t('dashboard.subjects.desc'),
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: t('dashboard.assessments'),
      value: stats?.assessmentsCount || 0,
      description: t('dashboard.assessments.desc'),
      icon: ClipboardCheck,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* Plan Limit Warning */}
      {!planLoading && planLimits && (planLimits.isLimitReached || planLimits.isLimitExceeded) && (
        <Alert variant="destructive" className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {planLimits.isLimitExceeded ? t('dashboard.plan.exceeded') : t('dashboard.plan.reached')}
          </AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm">
              Vous avez <strong>{planLimits.currentStudents} élèves</strong> mais votre plan{" "}
              <strong>{planLimits.planName}</strong> permet seulement{" "}
              <strong>{planLimits.maxStudents} élèves</strong>.
              {planLimits.isLimitExceeded 
                ? " Vous ne pouvez plus ajouter d'élèves." 
                : " Vous avez atteint la limite maximale."}
            </div>
            <Button 
              onClick={() => navigate('/dashboard/billing')}
              variant="default"
              size="sm"
              className="w-full sm:w-auto flex-shrink-0"
            >
              {t('dashboard.plan.upgrade')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg blur-3xl" />
        <div className="relative p-4 sm:p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                {t('dashboard.title')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{t('dashboard.subtitle')}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full h-auto flex flex-wrap gap-1 p-1">
          <TabsTrigger value="overview" className="flex-1 min-w-[70px] flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline truncate">{t('dashboard.tabs.overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex-1 min-w-[70px] flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline truncate">{t('dashboard.tabs.assistant')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 min-w-[70px] flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline truncate">{t('dashboard.tabs.analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex-1 min-w-[70px] flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 text-xs sm:text-sm">
            <ClipboardCheck className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline truncate">{t('dashboard.tabs.generator')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium truncate">
                      {card.title}
                    </CardTitle>
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex-shrink-0">
                      <card.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="text-xl sm:text-2xl font-bold">
                      {loading ? <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" /> : card.value}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AIAssistant />
            
            <Card className="border-accent/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span className="truncate">{t('dashboard.ai.title')}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t('dashboard.ai.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 pt-0">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t('dashboard.ai.predictive')}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t('dashboard.ai.generation')}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-accent/70 animate-pulse flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t('dashboard.ai.recommendations')}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-primary/70 animate-pulse flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">{t('dashboard.ai.detection')}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="truncate">{t('dashboard.innovations.title')}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t('dashboard.innovations.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 pt-0">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-medium">🎙️ {t('dashboard.innovations.voice')}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.innovations.voice.desc')}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-medium">🔮 {t('dashboard.innovations.analytics')}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.innovations.analytics.desc')}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-medium">⚡ {t('dashboard.innovations.generation')}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.innovations.generation.desc')}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-medium">🧠 {t('dashboard.innovations.adaptive')}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('dashboard.innovations.adaptive.desc')}</div>
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
                <CardTitle>{t('dashboard.guide.title')}</CardTitle>
                <CardDescription>{t('dashboard.guide.desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">🎤 {t('dashboard.guide.voice.title')}</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• "Créer une évaluation de mathématiques niveau 5ème"</li>
                    <li>• "Analyser les performances de Pierre Martin"</li>
                    <li>• "Générer un rapport pour la classe de 3ème A"</li>
                    <li>• "Quelles sont les prédictions pour ce trimestre ?"</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">🤖 {t('dashboard.guide.capabilities.title')}</h4>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• {t('dashboard.ai.predictive')}</li>
                    <li>• {t('dashboard.ai.generation')}</li>
                    <li>• {t('dashboard.ai.recommendations')}</li>
                    <li>• {t('dashboard.ai.detection')}</li>
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