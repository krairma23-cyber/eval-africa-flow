import { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // IMPORTANT: Set up auth listener BEFORE calling getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
        
        if (event === 'SIGNED_IN' && session) {
          setLoading(false);
        }

        if (event === 'TOKEN_REFRESHED') {
          // Session refreshed successfully
        }
      }
    );

    // Then get the initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          logError('Session retrieval failed', error, {
            component: 'DashboardLayout',
            action: 'get_session'
          });
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        logError('Auth initialization failed', error, {
          component: 'DashboardLayout',
          action: 'init_auth'
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la déconnexion",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Déconnexion",
          description: "Vous avez été déconnecté avec succès",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="w-60 border-r bg-sidebar">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-background flex items-center justify-between px-2 sm:px-4 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger />
              <img 
                src="/evalscol-logo.png" 
                alt="EvalScol Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain flex-shrink-0"
              />
              <h1 className="font-semibold text-base sm:text-lg truncate">EvalScol</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2 text-sm min-w-0">
                <UserIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate max-w-[180px]">{user.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}