import { LoginForm } from "@/components/auth/LoginForm";
import Seo from "@/components/Seo";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();

  // Already signed in: go straight to the dashboard instead of showing the form.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  return (
    <>
      <Seo
        title="Connexion | EvalScol Africa"
        description="Connectez-vous à EvalScol Africa pour gérer votre établissement scolaire : élèves, notes, bulletins et paiements."
        path="/auth"
      />
      <div className="relative min-h-screen">
        <LoginForm />
        <div className="absolute left-3 top-3 z-20 sm:left-4 sm:top-4">
          {/* Always home: going "back" after logout would hit the protected dashboard and loop here. */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-card/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
}
