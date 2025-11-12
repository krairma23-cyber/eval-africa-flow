import { Brain, CreditCard, Sparkles, Users } from "lucide-react";

export const SolutionSlide = () => {
  const solutions = [
    {
      icon: Sparkles,
      title: "Automatisation Complète",
      description: "Génération automatique de bulletins, calculs de moyennes, classements",
      impact: "90% de temps gagné"
    },
    {
      icon: Brain,
      title: "IA Générative Native",
      description: "Génération de contenus pédagogiques, détection élèves à risque, analyses prédictives",
      impact: "First-mover advantage"
    },
    {
      icon: CreditCard,
      title: "Paiements Intégrés",
      description: "Mobile Money (Orange, MTN, Moov) + cartes bancaires via Paystack",
      impact: "Réduction 60% impayés"
    },
    {
      icon: Users,
      title: "Portail Parent Temps Réel",
      description: "Accès 24/7 aux notes, absences, bulletins via smartphone",
      impact: "100% transparence"
    }
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="mb-12">
        <h2 className="text-5xl font-bold text-foreground mb-4">Notre Solution</h2>
        <p className="text-xl text-muted-foreground max-w-3xl">
          EvalScol Africa Flow : La première plateforme SaaS tout-en-un avec IA pour transformer la gestion scolaire en Afrique
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {solutions.map((solution, index) => (
          <div
            key={index}
            className="bg-card p-8 rounded-xl border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <solution.icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {solution.title}
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {solution.description}
            </p>
            <div className="pt-4 border-t border-border">
              <span className="text-sm font-semibold text-primary">
                ✓ {solution.impact}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-lg text-center font-semibold text-primary">
          🚀 100% Cloud • 99.9% Uptime • Conforme RGPD • Déploiement en 5 jours
        </p>
      </div>
    </div>
  );
};
