import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  School, Users, GraduationCap, UserCheck,
  DollarSign, TrendingUp, TrendingDown, Percent,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

const mockRevenueVsExpenses = [
  { month: "Mar", revenue: 120000, expenses: 85000 },
  { month: "Avr", revenue: 145000, expenses: 90000 },
  { month: "Mai", revenue: 180000, expenses: 95000 },
  { month: "Jun", revenue: 210000, expenses: 100000 },
  { month: "Jul", revenue: 250000, expenses: 105000 },
  { month: "Aoû", revenue: 290000, expenses: 110000 },
  { month: "Sep", revenue: 350000, expenses: 115000 },
  { month: "Oct", revenue: 420000, expenses: 120000 },
  { month: "Nov", revenue: 480000, expenses: 125000 },
  { month: "Déc", revenue: 540000, expenses: 130000 },
  { month: "Jan", revenue: 600000, expenses: 135000 },
  { month: "Fév", revenue: 680000, expenses: 140000 },
];

const mockSchoolGrowth = [
  { month: "Sep", schools: 2 },
  { month: "Oct", schools: 5 },
  { month: "Nov", schools: 8 },
  { month: "Déc", schools: 12 },
  { month: "Jan", schools: 18 },
  { month: "Fév", schools: 25 },
];

function formatCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function CCOverview() {
  const [stats, setStats] = useState({
    schools: 0, students: 0, teachers: 0, parents: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [schoolsRes, studentsRes, teachersRes] = await Promise.all([
      supabase.from("schools").select("id", { count: "exact", head: true }),
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("teachers").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      schools: schoolsRes.count || 0,
      students: studentsRes.count || 0,
      teachers: teachersRes.count || 0,
      parents: Math.floor((studentsRes.count || 0) * 0.8),
    });
  };

  const mrr = 680000;
  const expenses = 140000;
  const profit = mrr - expenses;
  const growthMoM = 13.3;

  const kpis = [
    { label: "Écoles actives", value: stats.schools, icon: School, color: "text-emerald-400" },
    { label: "Élèves", value: stats.students, icon: Users, color: "text-blue-400" },
    { label: "Enseignants", value: stats.teachers, icon: GraduationCap, color: "text-purple-400" },
    { label: "Parents", value: stats.parents, icon: UserCheck, color: "text-amber-400" },
    { label: "MRR", value: formatCFA(mrr), icon: DollarSign, color: "text-emerald-400" },
    { label: "Dépenses/mois", value: formatCFA(expenses), icon: TrendingDown, color: "text-red-400" },
    { label: "Profit/mois", value: formatCFA(profit), icon: TrendingUp, color: profit > 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Croissance MoM", value: `+${growthMoM}%`, icon: Percent, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble stratégique en temps réel</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-[#12121a] border-gray-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-800/50 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className={`text-lg font-bold ${kpi.color}`}>
                  {typeof kpi.value === "number" ? kpi.value.toLocaleString("fr-FR") : kpi.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#12121a] border-gray-800/50 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Revenus vs Dépenses (12 mois)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockRevenueVsExpenses}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
              <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
              <YAxis stroke="#4b5563" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" name="Revenus" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#expGrad)" name="Dépenses" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-[#12121a] border-gray-800/50 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Croissance Écoles</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockSchoolGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
              <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
              <YAxis stroke="#4b5563" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }}
              />
              <Bar dataKey="schools" fill="#10b981" radius={[4, 4, 0, 0]} name="Écoles" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
