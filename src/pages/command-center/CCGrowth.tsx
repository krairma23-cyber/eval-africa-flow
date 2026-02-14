import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { TrendingUp, UserCheck, RefreshCw, ArrowDown, ArrowUp } from "lucide-react";

const funnelData = [
  { stage: "Visiteurs site", count: 12000, color: "#6b7280" },
  { stage: "Essais gratuits", count: 180, color: "#3b82f6" },
  { stage: "Abonnements payants", count: 45, color: "#10b981" },
  { stage: "Upgrades", count: 12, color: "#8b5cf6" },
  { stage: "Churn", count: 4, color: "#ef4444" },
];

const userGrowth = [
  { month: "Sep", users: 30 }, { month: "Oct", users: 65 },
  { month: "Nov", users: 120 }, { month: "Déc", users: 210 },
  { month: "Jan", users: 350 }, { month: "Fév", users: 520 },
];

const conversionTrialToPaid = 25;
const retention30d = 88;
const retention90d = 72;
const monthlyGrowth = 48.6;

const growthKpis = [
  { label: "Conversion essai → payant", value: `${conversionTrialToPaid}%`, icon: TrendingUp, color: "text-emerald-400" },
  { label: "Rétention 30 jours", value: `${retention30d}%`, icon: UserCheck, color: "text-blue-400" },
  { label: "Rétention 90 jours", value: `${retention90d}%`, icon: RefreshCw, color: "text-purple-400" },
  { label: "Croissance mensuelle", value: `+${monthlyGrowth}%`, icon: ArrowUp, color: "text-emerald-400" },
];

export default function CCGrowth() {
  const maxFunnel = funnelData[0].count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Growth Analytics</h1>
        <p className="text-sm text-gray-500">Funnel SaaS et métriques de croissance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {growthKpis.map((kpi) => (
          <Card key={kpi.label} className="bg-[#12121a] border-gray-800/50 p-4">
            <div className="flex items-center gap-2">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <p className="text-xs text-gray-500">{kpi.label}</p>
            </div>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Funnel */}
      <Card className="bg-[#12121a] border-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Funnel SaaS</h3>
        <div className="space-y-3">
          {funnelData.map((step, i) => {
            const widthPct = Math.max((step.count / maxFunnel) * 100, 5);
            return (
              <div key={step.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">{step.stage}</span>
                  <span className="text-sm font-mono text-gray-400">{step.count.toLocaleString()}</span>
                </div>
                <div className="h-6 bg-gray-800/50 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${widthPct}%`, backgroundColor: step.color }}
                  >
                    {widthPct > 15 && (
                      <span className="text-[10px] text-white/80 font-mono">
                        {i > 0 ? `${((step.count / funnelData[i - 1].count) * 100).toFixed(1)}%` : "100%"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* User Growth */}
      <Card className="bg-[#12121a] border-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Courbe d'expansion utilisateur</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={userGrowth}>
            <defs>
              <linearGradient id="growGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
            <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
            <YAxis stroke="#4b5563" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }} />
            <Area type="monotone" dataKey="users" stroke="#10b981" fill="url(#growGrad)" name="Utilisateurs" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
