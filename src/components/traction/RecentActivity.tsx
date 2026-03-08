import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  resource_type: string;
  created_at: string;
  user_id: string | null;
}

const actionLabels: Record<string, string> = {
  INSERT: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  LOGIN: "Connexion",
};

const resourceLabels: Record<string, string> = {
  students: "Élève",
  teachers: "Enseignant",
  classrooms: "Classe",
  assessments: "Évaluation",
  assessment_results: "Note",
  enrollments: "Inscription",
  schools: "École",
  profiles: "Profil",
  user_subscriptions: "Abonnement",
};

export function RecentActivity({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5" />
          Activité récente sur la plateforme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {actionLabels[item.action] || item.action}
                </Badge>
                <span className="text-sm">
                  {resourceLabels[item.resource_type] || item.resource_type}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Aucune activité récente</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
