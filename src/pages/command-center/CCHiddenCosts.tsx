import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, HardDrive, HeadphonesIcon, Clock, Bug, TrendingUp } from "lucide-react";

const hiddenCosts = [
  {
    label: "Stockage total utilisé",
    value: "2.4 GB",
    cost: "~3 500 FCFA/mois",
    icon: HardDrive,
    status: "ok" as const,
  },
  {
    label: "Coût stockage estimé",
    value: "3 500 FCFA",
    cost: "+15% vs mois dernier",
    icon: TrendingUp,
    status: "warning" as const,
  },
  {
    label: "Tickets support / mois",
    value: "23",
    cost: "~2h/semaine de temps",
    icon: HeadphonesIcon,
    status: "ok" as const,
  },
  {
    label: "Temps onboarding moyen",
    value: "45 min",
    cost: "Cible: < 30 min",
    icon: Clock,
    status: "warning" as const,
  },
  {
    label: "Bugs ouverts",
    value: "7",
    cost: "3 critiques",
    icon: Bug,
    status: "danger" as const,
  },
];

const alerts = [
  { message: "Coûts de stockage en hausse de 15% ce mois", level: "warning" as const },
  { message: "3 bugs critiques non résolus depuis > 7 jours", level: "danger" as const },
  { message: "Temps d'onboarding 50% au-dessus de la cible", level: "warning" as const },
];

function statusColor(status: "ok" | "warning" | "danger") {
  if (status === "ok") return "border-emerald-500/20 bg-emerald-500/5";
  if (status === "warning") return "border-amber-500/20 bg-amber-500/5";
  return "border-red-500/20 bg-red-500/5";
}

function statusIconColor(status: "ok" | "warning" | "danger") {
  if (status === "ok") return "text-emerald-400";
  if (status === "warning") return "text-amber-400";
  return "text-red-400";
}

function alertBadge(level: "warning" | "danger") {
  return level === "danger"
    ? "bg-red-500/10 text-red-400 border-red-500/20"
    : "bg-amber-500/10 text-amber-400 border-amber-500/20";
}

export default function CCHiddenCosts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Hidden Costs</h1>
        <p className="text-sm text-gray-500">Identifier les coûts invisibles qui grèvent la rentabilité</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="bg-[#12121a] border-gray-800/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400">Alertes actives</h3>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-800/30">
                <Badge variant="outline" className={alertBadge(alert.level)}>
                  {alert.level === "danger" ? "CRITIQUE" : "ATTENTION"}
                </Badge>
                <span className="text-sm text-gray-300">{alert.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cost Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hiddenCosts.map((item) => (
          <Card key={item.label} className={`border p-5 ${statusColor(item.status)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${statusIconColor(item.status)}`} />
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-3">{item.value}</p>
            <p className="text-xs text-gray-500 mt-1">{item.cost}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
