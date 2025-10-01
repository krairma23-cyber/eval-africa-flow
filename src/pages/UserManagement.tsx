import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Crown, Shield, User } from "lucide-react";
import { logError } from "@/lib/logger";

interface UserWithRole {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  role?: 'admin' | 'moderator' | 'user';
  school_id?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Vérifier si l'utilisateur est admin
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (userRoles?.role === 'admin') {
        setIsAdmin(true);
        await loadUsers();
      } else {
        toast({
          title: "Accès refusé",
          description: "Vous devez être administrateur pour accéder à cette page",
          variant: "destructive",
        });
      }
    } catch (error) {
      await logError('Failed to check admin status', error, {
        component: 'UserManagement',
        action: 'CHECK_ADMIN'
      });
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Récupérer les utilisateurs avec leurs profils et rôles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          school_id,
          created_at,
          user_roles!inner(role)
          `);

      if (error) {
        await logError('Failed to fetch profiles', error, {
          component: 'UserManagement',
          action: 'FETCH_PROFILES'
        });
        return;
      }

      if (profiles) {
        // Pour simplifier, on va utiliser les données disponibles directement
        const usersWithRoles = profiles.map((profile: any) => ({
          id: profile.user_id,
          email: 'Email via auth', // Simplifié pour éviter les appels admin
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: profile.user_roles?.[0]?.role || 'user',
          school_id: profile.school_id
        }));
        
        setUsers(usersWithRoles);
      }
    } catch (error) {
      await logError('Failed to load users', error, {
        component: 'UserManagement',
        action: 'LOAD_USERS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Rôle mis à jour",
        description: "Le rôle de l'utilisateur a été modifié avec succès",
      });

      // Recharger les utilisateurs
      await loadUsers();
    } catch (error) {
      await logError('Failed to update user role', error, {
        component: 'UserManagement',
        action: 'UPDATE_ROLE',
        metadata: { userId, newRole }
      });
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
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
            <CardDescription>
              Vous devez être administrateur pour accéder à cette page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'moderator':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérez les rôles et permissions des utilisateurs
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs inscrits ({users.length})
            </CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs avec leurs rôles actuels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">
                        {user.full_name || 'Nom non renseigné'}
                      </h3>
                      <Badge variant={getRoleBadgeVariant(user.role || 'user')} className="flex items-center gap-1">
                        {getRoleIcon(user.role || 'user')}
                        {user.role || 'user'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.role || 'user'}
                      onValueChange={(newRole) => updateUserRole(user.id, newRole as 'admin' | 'moderator' | 'user')}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="moderator">Modérateur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}