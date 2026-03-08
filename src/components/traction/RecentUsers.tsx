import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Crown, GraduationCap, User } from "lucide-react";

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: string | null;
}

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  teacher: "Enseignant",
  user: "Utilisateur",
};

export function RecentUsers({ users }: { users: RecentUser[] }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5" />
          10 derniers utilisateurs inscrits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm truncate">
                    {user.full_name || "Nom non renseigné"}
                  </span>
                  <Badge variant={getRoleBadgeVariant(user.role || "user")} className="flex items-center gap-1 text-xs shrink-0">
                    {getRoleIcon(user.role || "user")}
                    {roleLabels[user.role || "user"] || user.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                {new Date(user.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-6">Aucun utilisateur trouvé</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
