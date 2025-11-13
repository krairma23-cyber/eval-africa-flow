import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const redirectIfAuthenticated = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    };

    redirectIfAuthenticated();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return <LoginForm />;
}