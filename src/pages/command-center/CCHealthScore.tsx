import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Health scoring dimensions
const dimensions = [
  { name: "Rentabilité", score: 78, weight: 25 },
  { name: "Croissance", score: 85, weight: 25 },
  { name: "Rétention", score: 72, weight: 20 },
  { name: "Stabilité technique", score: 82, weight: 15 },
  { name: "Dépendances", score: 45, weight: 15 },
];

function computeHealthScore() {
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);
  return Math.round(
    dimensions.reduce((s, d) => s + d.score * d.weight, 0) / totalWeight
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500", ring: "ring-emerald-500/30" };
  if (score >= 60) return { text: "text-amber-400", bg: "bg-amber-500", ring: "ring-amber-500/30" };
  return { text: "text-red-400", bg: "bg-red-500", ring: "ring-red-500/30" };
}

function getDimensionBarColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function generateInsight(score: number): string {
  const lowDeps = dimensions.find(d => d.name === "Dépendances");
  const growth = dimensions.find(d => d.name === "Croissance");
  const retention = dimensions.find(d => d.name === "Rétention");

  const insights: string[] = [];

  if (growth && growth.score >= 80) insights.push("Croissance forte");
  if (retention && retention.score < 75) insights.push("rétention à surveiller");
  if (lowDeps && lowDeps.score < 50) insights.push("dépendance élevée à Supabase/Paystack");
  if (score >= 80) insights.unshift("Plateforme en bonne santé");
  else if (score >= 60) insights.unshift("Plateforme stable");
  else insights.unshift("Situation critique");

  return insights.join(" mais ") + ".";
}

export default function CCHealthScore() {
  const healthScore = computeHealthScore();
  const colors = getScoreColor(healthScore);
  const insight = generateInsight(healthScore);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Health Score</h1>
        <p className="text-sm text-gray-500">Score global de santé de la plateforme</p>
      </div>

      {/* Main Score */}
      <Card className="bg-[#12121a] border-gray-800/50 p-8 text-center">
        <Activity className={`h-8 w-8 mx-auto mb-4 ${colors.text}`} />
        <div className={cn("inline-flex items-center justify-center w-40 h-40 rounded-full ring-4", colors.ring, "bg-gray-800/30")}>
          <div>
            <p className={`text-5xl font-black ${colors.text}`}>{healthScore}</p>
            <p className="text-sm text-gray-500">/100</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-white mt-6">EvalScol Health Score</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto italic">
          "{insight}"
        </p>
      </Card>

      {/* Dimensions */}
      <Card className="bg-[#12121a] border-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Détail par dimension</h3>
        <div className="space-y-4">
          {dimensions.map((dim) => (
            <div key={dim.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">{dim.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Poids: {dim.weight}%</span>
                  <span className={`text-sm font-bold ${getScoreColor(dim.score).text}`}>
                    {dim.score}/100
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getDimensionBarColor(dim.score)}`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="bg-[#12121a] border-gray-800/50 p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Recommandations prioritaires</h3>
        <div className="space-y-2">
          {dimensions
            .filter(d => d.score < 70)
            .sort((a, b) => a.score - b.score)
            .map(dim => (
              <div key={dim.name} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/20">
                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${getDimensionBarColor(dim.score)}`} />
                <div>
                  <p className="text-sm text-gray-200 font-medium">{dim.name} — {dim.score}/100</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dim.name === "Dépendances"
                      ? "Réduire la dépendance à un seul fournisseur. Ajouter Flutterwave et prévoir backup DB."
                      : dim.name === "Rétention"
                      ? "Améliorer l'onboarding et ajouter un programme de fidélisation client."
                      : "Optimiser ce score pour améliorer la santé globale."}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
