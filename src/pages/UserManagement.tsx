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
  role?: 'admin' | 'teacher' | 'user';
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
        .eq('role', 'admin')
        .maybeSingle();

      if (userRoles) {
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
      // Use secure RPC function with server-side admin validation
      // @ts-ignore - RPC function exists but types need regeneration
      const { data, error } = await supabase.rpc('get_users_for_admin');

      if (error) {
        await logError('Failed to fetch users via RPC', error, {
          component: 'UserManagement',
          action: 'FETCH_USERS_RPC'
        });
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        });
        return;
      }

      if (data && Array.isArray(data)) {
        // Map RPC response to UserWithRole interface
        const usersWithRoles = data.map((user: any) => ({
          id: user.user_id, // Map user_id to id
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at,
          role: user.role as 'admin' | 'teacher' | 'user',
          school_id: user.school_id
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

  const updateUserRole = async (userId: string, newRole: 'admin' | 'teacher' | 'user') => {
    try {
      // Use secure function to update role with audit logging
      const { data, error } = await supabase
        .rpc('update_user_role', {
          target_user_id: userId,
          new_role: newRole,
          justification: `Rôle modifié en ${newRole} via l'interface de gestion`
        });

      if (error) throw error;

      toast({
        title: "Rôle mis à jour",
        description: "Le rôle a été modifié avec succès et enregistré dans les logs d'audit",
      });

      // Recharger les utilisateurs
      await loadUsers();
    } catch (error: any) {
      await logError('Failed to update user role', error, {
        component: 'UserManagement',
        action: 'UPDATE_ROLE',
        metadata: { userId, newRole }
      });
      
      // Provide specific error messages based on error type
      let errorMessage = "Impossible de mettre à jour le rôle";
      if (error.message?.includes('Admin access required')) {
        errorMessage = "Vous devez être administrateur pour modifier les rôles";
      } else if (error.message?.includes('Cannot modify your own role')) {
        errorMessage = "Vous ne pouvez pas modifier votre propre rôle pour des raisons de sécurité";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
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
      case 'teacher':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'teacher':
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
                      onValueChange={(newRole) => updateUserRole(user.id, newRole as 'admin' | 'teacher' | 'user')}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="teacher">Enseignant</SelectItem>
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