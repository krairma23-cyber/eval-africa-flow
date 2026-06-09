import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "super_admin" | "teacher" | "user" | "moderator";

interface UseRoleResult {
  roles: AppRole[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Centralised role lookup using the SECURITY DEFINER RPC `get_current_user_roles`.
 * Avoids scattered direct reads on the `user_roles` table from client code.
 */
export function useRole(): UseRoleResult {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRoles([]);
        return;
      }
      const { data, error } = await supabase.rpc("get_current_user_roles");
      if (error) {
        setRoles([]);
        return;
      }
      setRoles(((data as Array<{ role: AppRole }>) ?? []).map((r) => r.role));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    roles,
    isAdmin: roles.includes("admin") || roles.includes("super_admin"),
    isSuperAdmin: roles.includes("super_admin"),
    isTeacher: roles.includes("teacher"),
    loading,
    refresh: load,
  };
}
