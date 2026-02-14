import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { DollarSign, Flame, Clock, Target, UserPlus } from "lucide-react";

const expenseCategories = [
  { name: "Hébergement Supabase", amount: 35000, color: "#10b981" },
  { name: "Paystack fees", amount: 18000, color: "#3b82f6" },
  { name: "Marketing", amount: 25000, color: "#f59e0b" },
  { name: "Salaires / Freelances", amount: 40000, color: "#8b5cf6" },
  { name: "Outils SaaS", amount: 12000, color: "#ec4899" },
  { name: "Support & Télécom", amount: 7000, color: "#06b6d4" },
  { name: "Autres", amount: 3000, color: "#6b7280" },
];

const mrrEvolution = [
  { month: "Sep", mrr: 120000 }, { month: "Oct", mrr: 180000 },
  { month: "Nov", mrr: 250000 }, { month: "Déc", mrr: 350000 },
  { month: "Jan", mrr: 500000 }, { month: "Fév", mrr: 680000 },
];

function formatCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

const totalExpenses = expenseCategories.reduce((s, c) => s + c.amount, 0);
const burnRate = totalExpenses;
const cashReserve = 2500000;
const runwayMonths = Math.floor(cashReserve / burnRate);
const ltv = 539910;
const cac = 45000;

const financialKpis = [
  { label: "Dépenses mensuelles", value: formatCFA(totalExpenses), icon: DollarSign, color: "text-red-400" },
  { label: "Burn rate", value: formatCFA(burnRate), icon: Flame, color: "text-orange-400" },
  { label: "Runway", value: `${runwayMonths} mois`, icon: Clock, color: runwayMonths > 12 ? "text-emerald-400" : "text-orange-400" },
  { label: "LTV moyen", value: formatCFA(ltv), icon: Target, color: "text-emerald-400" },
  { label: "CAC estimé", value: formatCFA(cac), icon: UserPlus, color: "text-blue-400" },
];

export default function CCFinancial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Financial Control</h1>
        <p className="text-sm text-gray-500">Pilotage financier détaillé</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {financialKpis.map((kpi) => (
          <Card key={kpi.label} className="bg-[#12121a] border-gray-800/50 p-4">
            <div className="flex items-center gap-2">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <p className="text-xs text-gray-500">{kpi.label}</p>
            </div>
            <p className={`text-lg font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Expense Breakdown Table */}
        <Card className="bg-[#12121a] border-gray-800/50 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Répartition des dépenses</h3>
          <div className="space-y-3">
            {expenseCategories.map((cat) => {
              const pct = ((cat.amount / totalExpenses) * 100).toFixed(1);
              return (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-gray-300">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-400">{formatCFA(cat.amount)}</span>
                    <Badge variant="outline" className="text-[10px] border-gray-700 text-gray-500">{pct}%</Badge>
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-gray-800 flex justify-between">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-sm font-bold text-red-400">{formatCFA(totalExpenses)}</span>
            </div>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-[#12121a] border-gray-800/50 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Répartition (camembert)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseCategories}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                strokeWidth={0}
              >
                {expenseCategories.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }}
                formatter={(value: number) => formatCFA(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* MRR Evolution */}
      <Card className="bg-[#12121a] border-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Évolution MRR</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={mrrEvolution}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f2e" />
            <XAxis dataKey="month" stroke="#4b5563" fontSize={12} />
            <YAxis stroke="#4b5563" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 8 }}
              formatter={(v: number) => formatCFA(v)}
            />
            <Area type="monotone" dataKey="mrr" stroke="#10b981" fill="url(#mrrGrad)" name="MRR" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
