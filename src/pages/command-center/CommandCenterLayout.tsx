import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Shield,
  TrendingUp,
  Activity,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Overview", path: "/command-center", icon: LayoutDashboard },
  { title: "Financial Control", path: "/command-center/financial", icon: DollarSign },
  { title: "Product Usage", path: "/command-center/usage", icon: BarChart3 },
  { title: "Hidden Costs", path: "/command-center/hidden-costs", icon: AlertTriangle },
  { title: "Risk & Fragility", path: "/command-center/risks", icon: Shield },
  { title: "Growth Analytics", path: "/command-center/growth", icon: TrendingUp },
  { title: "Health Score", path: "/command-center/health", icon: Activity },
];

export default function CommandCenterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("user_id", user.id)
      .single();
    if (data?.user_type === "super_admin") {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      navigate("/dashboard");
    }
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-800/50 bg-[#0d0d15] transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          {sidebarOpen && (
            <div>
              <h1 className="text-sm font-bold text-emerald-400 tracking-wider">EVALSCOL</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Command Center</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                )}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-emerald-400")} />
                {sidebarOpen && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800/50">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Retour Dashboard</span>}
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <main className={cn("flex-1 transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <div className="p-6 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
