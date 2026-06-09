import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";

interface AdminRouteProps {
  children: ReactNode;
  /** Allow super_admin only (default: admin OR super_admin) */
  superOnly?: boolean;
}

/**
 * Guards admin-only routes. Performs server-side role checks via the
 * `get_current_user_roles` RPC. Redirects unauthenticated users to /auth
 * and non-admins to /dashboard.
 */
export default function AdminRoute({ children, superOnly = false }: AdminRouteProps) {
  const { isAdmin, isSuperAdmin, loading, roles } = useRole();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (roles.length === 0) {
    return <Navigate to="/auth" replace />;
  }

  const allowed = superOnly ? isSuperAdmin : isAdmin;
  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
