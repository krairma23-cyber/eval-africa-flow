import { Card, CardContent } from "@/components/ui/card";
import {
  Users, UserCheck, School, GraduationCap, CreditCard,
  TrendingUp, DollarSign, Percent
} from "lucide-react";

interface TractionKPIsProps {
  totalUsers: number;
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalEnrollments: number;
  paidSubscribers: number;
  mrr: number;
  arr: number;
  conversionRate: number;
  cac: number;
  ltv: number;
}

export function TractionKPIs({
  totalUsers, totalSchools, totalStudents, totalTeachers,
  totalEnrollments, paidSubscribers, mrr, conversionRate
}: TractionKPIsProps) {
  const kpis = [
    { label: "Utilisateurs", value: totalUsers.toLocaleString("fr-FR"), icon: Users, color: "text-blue-500" },
    { label: "Écoles", value: totalSchools.toLocaleString("fr-FR"), icon: School, color: "text-emerald-500" },
    { label: "Élèves", value: totalStudents.toLocaleString("fr-FR"), icon: UserCheck, color: "text-purple-500" },
    { label: "Enseignants", value: totalTeachers.toLocaleString("fr-FR"), icon: GraduationCap, color: "text-amber-500" },
    { label: "Inscriptions", value: totalEnrollments.toLocaleString("fr-FR"), icon: TrendingUp, color: "text-teal-500" },
    { label: "Abonnés payants", value: paidSubscribers.toLocaleString("fr-FR"), icon: CreditCard, color: "text-green-500" },
    { label: "MRR", value: `${mrr.toLocaleString("fr-FR")} FCFA`, icon: DollarSign, color: "text-yellow-500" },
    { label: "Taux conversion", value: `${conversionRate.toFixed(1)}%`, icon: Percent, color: "text-rose-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                <p className="text-xl font-bold truncate">{kpi.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
