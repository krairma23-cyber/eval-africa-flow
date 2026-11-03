import { LoginForm } from "@/components/auth/LoginForm";
import Seo from "@/components/Seo";
import BackLink from "@/components/navigation/BackLink";

export default function Auth() {
  return (
    <>
      <Seo
        title="Connexion | EvalScol Africa"
        description="Connectez-vous à EvalScol Africa pour gérer votre établissement scolaire : élèves, notes, bulletins et paiements."
        path="/auth"
      />
      <LoginForm />
      <div className="fixed left-3 top-3 z-20 sm:left-4 sm:top-4">
        <BackLink
          variant="link"
          className="rounded-md bg-card/80 px-3 py-1.5 shadow-sm backdrop-blur-sm"
        />
      </div>
    </>
  );
}
