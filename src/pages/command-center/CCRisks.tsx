import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle } from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

interface Risk {
  name: string;
  level: RiskLevel;
  score: number;
  value: string;
  recommendation: string;
}

const risks: Risk[] = [
  {
    name: "Dépendance Supabase",
    level: "high",
    score: 85,
    value: "85%",
    recommendation: "Prévoir un plan de migration vers PostgreSQL autogéré en cas de changement de pricing Supabase.",
  },
  {
    name: "Dépendance Paystack",
    level: "medium",
    score: 70,
    value: "70%",
    recommendation: "Intégrer un 2e processeur de paiement (Flutterwave, CinetPay) pour réduire la dépendance.",
  },
  {
    name: "Concentration revenus (Top 3 écoles)",
    level: "high",
    score: 62,
    value: "62%",
    recommendation: "Diversifier la base client urgentement. Objectif : Top 3 < 40% du revenu total.",
  },
  {
    name: "Taux churn",
    level: "medium",
    score: 8,
    value: "8%",
    recommendation: "Mettre en place un programme de rétention : onboarding amélioré, success manager dédié.",
  },
  {
    name: "Dette technique estimée",
    level: "medium",
    score: 45,
    value: "45/100",
    recommendation: "Planifier 20% du sprint de dev pour la réduction de dette technique. Priorité : refactoring des composants monolithiques.",
  },
];

function levelColor(level: RiskLevel) {
  if (level === "low") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (level === "medium") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

function levelLabel(level: RiskLevel) {
  if (level === "low") return "LOW";
  if (level === "medium") return "MEDIUM";
  return "HIGH";
}

function scoreBarColor(level: RiskLevel) {
  if (level === "low") return "bg-emerald-500";
  if (level === "medium") return "bg-amber-500";
  return "bg-red-500";
}

export default function CCRisks() {
  const avgScore = Math.round(risks.reduce((s, r) => s + r.score, 0) / risks.length);
  const highRisks = risks.filter(r => r.level === "high").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Risk & Fragility</h1>
        <p className="text-sm text-gray-500">Carte des risques stratégiques</p>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#12121a] border-gray-800/50 p-5 text-center">
          <Shield className="h-6 w-6 mx-auto text-gray-500 mb-2" />
          <p className="text-xs text-gray-500">Risques identifiés</p>
          <p className="text-3xl font-bold text-white">{risks.length}</p>
        </Card>
        <Card className="bg-[#12121a] border-red-500/20 p-5 text-center">
          <AlertCircle className="h-6 w-6 mx-auto text-red-400 mb-2" />
          <p className="text-xs text-gray-500">Risques HIGH</p>
          <p className="text-3xl font-bold text-red-400">{highRisks}</p>
        </Card>
        <Card className="bg-[#12121a] border-gray-800/50 p-5 text-center">
          <p className="text-xs text-gray-500 mb-2">Score moyen de gravité</p>
          <p className={`text-3xl font-bold ${avgScore > 60 ? "text-amber-400" : "text-emerald-400"}`}>
            {avgScore}/100
          </p>
        </Card>
      </div>

      {/* Risk Table */}
      <Card className="bg-[#12121a] border-gray-800/50 p-5">
        <div className="space-y-4">
          {risks.map((risk) => (
            <div key={risk.name} className="p-4 rounded-lg bg-gray-800/20 border border-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-200">{risk.name}</span>
                  <Badge variant="outline" className={levelColor(risk.level)}>
                    {levelLabel(risk.level)}
                  </Badge>
                </div>
                <span className="text-sm font-mono text-gray-400">{risk.value}</span>
              </div>
              {/* Score bar */}
              <div className="h-1.5 bg-gray-800 rounded-full mb-3">
                <div
                  className={`h-full rounded-full ${scoreBarColor(risk.level)}`}
                  style={{ width: `${risk.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 italic">
                💡 {risk.recommendation}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
