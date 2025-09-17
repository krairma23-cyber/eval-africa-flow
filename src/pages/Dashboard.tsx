import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, ClipboardCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      console.error('Error fetching dashboard stats:', error);
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre établissement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
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
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Dernières évaluations et notes saisies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Aucune activité récente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rappels</CardTitle>
            <CardDescription>
              Évaluations à venir et tâches importantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Aucun rappel pour le moment
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}