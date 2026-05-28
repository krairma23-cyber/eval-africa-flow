import { LoginForm } from "@/components/auth/LoginForm";
import Seo from "@/components/Seo";

export default function Auth() {
  return (
    <>
      <Seo
        title="Connexion | EvalScol Africa"
        description="Connectez-vous à EvalScol Africa pour gérer votre établissement scolaire : élèves, notes, bulletins et paiements."
        path="/auth"
      />
      <LoginForm />
    </>
  );
}
