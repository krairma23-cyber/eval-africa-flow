import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

interface CompletionStepProps {
  onComplete: () => void;
  loading: boolean;
}

export function CompletionStep({ onComplete, loading }: CompletionStepProps) {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center relative">
        <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse opacity-50" />
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-3">
          Félicitations ! 🎉
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Votre établissement est maintenant configuré et prêt à utiliser EvalScol
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 max-w-md mx-auto">
        <div className="flex items-start gap-3 text-left">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold">Prochaines étapes recommandées:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ajouter vos enseignants</li>
              <li>• Créer vos classes</li>
              <li>• Inscrire vos élèves</li>
              <li>• Configurer le calendrier scolaire</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          size="lg" 
          onClick={onComplete} 
          disabled={loading}
          className="px-8"
        >
          {loading ? "Finalisation..." : "Accéder au tableau de bord"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tous ces paramètres peuvent être modifiés dans les réglages
      </p>
    </div>
  );
}