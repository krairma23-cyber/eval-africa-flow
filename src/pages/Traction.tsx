import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, UserCheck, School, GraduationCap, CreditCard,
  TrendingUp, RefreshCw, Crown, Shield, User, Clock
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

interface TractionStats {
  totalUsers: number;
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalEnrollments: number;
  roleBreakdown: { role: string; count: number }[];
  subscriptionBreakdown: { plan: string; count: number }[];
  recentUsers: {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
    role: string | null;
  }[];
}

const COLORS = ["hsl(142, 76%, 36%)", "hsl(217, 91%, 60%)", "hsl(262, 83%, 58%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const planLabels: Record<string, string> = {
  "free-trial": "Essai Gratuit",
  standard: "Standard",
  professional: "Professional",
  enterprise: "Enterprise",
};

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  teacher: "Enseignant",
  user: "Utilisateur",
};

export default function Traction() {
  const [stats, setStats] = useState<TractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) return;
      setIsAdmin(true);
      await loadStats();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const [
        profilesRes,
        schoolsRes,
        studentsRes,
        teachersRes,
        enrollmentsRes,
        rolesRes,
        subscriptionsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name, created_at", { count: "exact" }),
        supabase.from("schools").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("user_subscriptions").select("plan_id, status"),
      ]);

      // Role breakdown
      const roleCounts: Record<string, number> = {};
      (rolesRes.data || []).forEach((r: any) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      const roleBreakdown = Object.entries(roleCounts).map(([role, count]) => ({
        role: roleLabels[role] || role,
        count,
      }));

      // Subscription breakdown
      const subCounts: Record<string, number> = {};
      const activeSubscriptions = (subscriptionsRes.data || []).filter(
        (s: any) => s.status === "active" || s.status === "trialing"
      );
      activeSubscriptions.forEach((s: any) => {
        const label = planLabels[s.plan_id] || s.plan_id;
        subCounts[label] = (subCounts[label] || 0) + 1;
      });
      const subscriptionBreakdown = Object.entries(subCounts).map(([plan, count]) => ({
        plan,
        count,
      }));

      // Recent users (last 10)
      const sortedProfiles = (profilesRes.data || [])
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      // Get roles for recent users
      const recentUserIds = sortedProfiles.map((p: any) => p.id);
      const { data: recentRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", recentUserIds);

      const roleMap: Record<string, string> = {};
      (recentRoles || []).forEach((r: any) => {
        roleMap[r.user_id] = r.role;
      });

      const recentUsers = sortedProfiles.map((p: any) => ({
        id: p.id,
        email: p.email || "N/A",
        full_name: p.full_name,
        created_at: p.created_at,
        role: roleMap[p.id] || "user",
      }));

      setStats({
        totalUsers: profilesRes.count || (profilesRes.data || []).length,
        totalSchools: schoolsRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        roleBreakdown,
        subscriptionBreakdown,
        recentUsers,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Accès restreint</CardTitle>
            <p className="text-muted-foreground">Réservé aux administrateurs</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    if (role === "admin") return <Crown className="h-3.5 w-3.5" />;
    if (role === "teacher") return <GraduationCap className="h-3.5 w-3.5" />;
    return <User className="h-3.5 w-3.5" />;
  };

  const getRoleBadgeVariant = (role: string): "destructive" | "secondary" | "outline" => {
    if (role === "admin") return "destructive";
    if (role === "teacher") return "secondary";
    return "outline";
  };

  const totalPaidSubscriptions = stats?.subscriptionBreakdown
    .filter(s => s.plan !== "Essai Gratuit")
    .reduce((sum, s) => sum + s.count, 0) || 0;

  const kpis = [
    { label: "Utilisateurs inscrits", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
    { label: "Écoles", value: stats?.totalSchools || 0, icon: School, color: "text-emerald-500" },
    { label: "Élèves", value: stats?.totalStudents || 0, icon: UserCheck, color: "text-purple-500" },
    { label: "Enseignants", value: stats?.totalTeachers || 0, icon: GraduationCap, color: "text-amber-500" },
    { label: "Inscriptions actives", value: stats?.totalEnrollments || 0, icon: TrendingUp, color: "text-teal-500" },
    { label: "Abonnés payants", value: totalPaidSubscriptions, icon: CreditCard, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traction & Utilisateurs</h1>
          <p className="text-muted-foreground">
            Statistiques réelles de la plateforme en temps réel
          </p>
        </div>
        <Button variant="outline" onClick={loadStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value.toLocaleString("fr-FR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition par rôle</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.roleBreakdown?.length || 0) > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats!.roleBreakdown}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ role, count }) => `${role}: ${count}`}
                  >
                    {stats!.roleBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucune donnée de rôle</p>
            )}
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Abonnements actifs par plan</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.subscriptionBreakdown?.length || 0) > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats!.subscriptionBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="plan" fontSize={12} className="fill-muted-foreground" />
                  <YAxis fontSize={12} className="fill-muted-foreground" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Abonnés" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun abonnement actif</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            10 derniers utilisateurs inscrits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats?.recentUsers || []).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">
                      {user.full_name || "Nom non renseigné"}
                    </span>
                    <Badge variant={getRoleBadgeVariant(user.role || "user")} className="flex items-center gap-1 text-xs">
                      {getRoleIcon(user.role || "user")}
                      {roleLabels[user.role || "user"] || user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
            {(stats?.recentUsers || []).length === 0 && (
              <p className="text-center text-muted-foreground py-6">Aucun utilisateur trouvé</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
