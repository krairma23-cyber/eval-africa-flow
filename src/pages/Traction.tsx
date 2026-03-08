import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Shield } from "lucide-react";
import { TractionKPIs } from "@/components/traction/TractionKPIs";
import { TractionCharts } from "@/components/traction/TractionCharts";
import { RecentUsers } from "@/components/traction/RecentUsers";
import { RecentActivity } from "@/components/traction/RecentActivity";

const planLabels: Record<string, string> = {
  "free-trial": "Essai Gratuit",
  standard: "Standard",
  professional: "Professional",
  enterprise: "Enterprise",
};

const planPrices: Record<string, number> = {
  standard: 29990,
  professional: 59990,
  enterprise: 149990,
};

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  teacher: "Enseignant",
  user: "Utilisateur",
};

export default function Traction() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // KPIs
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSchools, setTotalSchools] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [paidSubscribers, setPaidSubscribers] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [arr, setArr] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [cac, setCac] = useState(0);
  const [ltv, setLtv] = useState(0);

  // Charts
  const [roleBreakdown, setRoleBreakdown] = useState<{ role: string; count: number }[]>([]);
  const [subscriptionBreakdown, setSubscriptionBreakdown] = useState<{ plan: string; count: number }[]>([]);
  const [userGrowth, setUserGrowth] = useState<{ month: string; count: number }[]>([]);

  // Lists
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

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
        auditRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name, created_at", { count: "exact" }),
        supabase.from("schools").select("id", { count: "exact", head: true }),
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("teachers").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("user_subscriptions").select("plan_id, status"),
        supabase.from("audit_logs").select("id, operation, table_name, created_at, user_id").order("created_at", { ascending: false }).limit(15),
      ]);

      // Counts
      const usersCount = profilesRes.count || (profilesRes.data || []).length;
      setTotalUsers(usersCount);
      setTotalSchools(schoolsRes.count || 0);
      setTotalStudents(studentsRes.count || 0);
      setTotalTeachers(teachersRes.count || 0);
      setTotalEnrollments(enrollmentsRes.count || 0);

      // Roles
      const roleCounts: Record<string, number> = {};
      (rolesRes.data || []).forEach((r: any) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
      setRoleBreakdown(
        Object.entries(roleCounts).map(([role, count]) => ({
          role: roleLabels[role] || role,
          count,
        }))
      );

      // Subscriptions
      const activeSubs = (subscriptionsRes.data || []).filter(
        (s: any) => s.status === "active" || s.status === "trialing"
      );
      const subCounts: Record<string, number> = {};
      let totalMrr = 0;
      let paidCount = 0;

      activeSubs.forEach((s: any) => {
        const label = planLabels[s.plan_id] || s.plan_id;
        subCounts[label] = (subCounts[label] || 0) + 1;
        const price = planPrices[s.plan_id] || 0;
        if (price > 0) {
          totalMrr += price;
          paidCount++;
        }
      });

      setSubscriptionBreakdown(
        Object.entries(subCounts).map(([plan, count]) => ({ plan, count }))
      );
      setPaidSubscribers(paidCount);
      setMrr(totalMrr);
      setArr(totalMrr * 12);

      // Conversion rate
      const totalSubs = activeSubs.length;
      setConversionRate(totalSubs > 0 && usersCount > 0 ? (paidCount / usersCount) * 100 : 0);

      // CAC & LTV estimates
      const marketingCost = 25000; // estimation mensuelle marketing
      setCac(paidCount > 0 ? Math.round(marketingCost / paidCount) : 0);
      const avgMonthsRetention = 18;
      const avgRevenuePerUser = paidCount > 0 ? totalMrr / paidCount : 0;
      setLtv(Math.round(avgRevenuePerUser * avgMonthsRetention));

      // User growth (last 6 months)
      const profiles = profilesRes.data || [];
      const monthCounts: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        monthCounts[key] = 0;
      }
      profiles.forEach((p: any) => {
        const d = new Date(p.created_at);
        const key = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
        if (key in monthCounts) {
          monthCounts[key]++;
        }
      });
      setUserGrowth(Object.entries(monthCounts).map(([month, count]) => ({ month, count })));

      // Recent users (last 10)
      const sorted = [...profiles]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      const recentIds = sorted.map((p: any) => p.id);
      const { data: recentRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", recentIds);

      const roleMap: Record<string, string> = {};
      (recentRoles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });

      setRecentUsers(
        sorted.map((p: any) => ({
          id: p.id,
          email: p.email || "N/A",
          full_name: p.full_name,
          created_at: p.created_at,
          role: roleMap[p.id] || "user",
        }))
      );

      // Recent activity
      setRecentActivity(
        (auditRes.data || []).map((a: any) => ({
          id: a.id,
          action: a.operation,
          resource_type: a.table_name,
          created_at: a.created_at,
          user_id: a.user_id,
        }))
      );
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isAdmin) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traction & Utilisateurs</h1>
          <p className="text-muted-foreground">Métriques réelles de la plateforme en temps réel</p>
        </div>
        <Button variant="outline" onClick={loadStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      <TractionKPIs
        totalUsers={totalUsers}
        totalSchools={totalSchools}
        totalStudents={totalStudents}
        totalTeachers={totalTeachers}
        totalEnrollments={totalEnrollments}
        paidSubscribers={paidSubscribers}
        mrr={mrr}
        arr={arr}
        conversionRate={conversionRate}
        cac={cac}
        ltv={ltv}
      />

      <TractionCharts
        roleBreakdown={roleBreakdown}
        subscriptionBreakdown={subscriptionBreakdown}
        userGrowth={userGrowth}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <RecentUsers users={recentUsers} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
}
