import { AlertTriangle, Clock, DollarSign, TrendingDown } from "lucide-react";

export const ProblemSlide = () => {
  const problems = [
    {
      icon: Clock,
      title: "Surcharge Administrative",
      stat: "15-20h/semaine",
      description: "Temps perdu en gestion manuelle des notes et bulletins"
    },
    {
      icon: DollarSign,
      title: "Paiements Complexes",
      stat: "40% d'impayés",
      description: "Pas d'intégration mobile money, suivi manuel des paiements"
    },
    {
      icon: TrendingDown,
      title: "Échec Scolaire",
      stat: "25-30%",
      description: "Absence de détection précoce des élèves en difficulté"
    },
    {
      icon: AlertTriangle,
      title: "Manque de Transparence",
      stat: "70% de plaintes",
      description: "Parents sans accès en temps réel aux résultats de leurs enfants"
    }
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-12">
        <h2 className="text-5xl font-bold text-foreground mb-4">Le Problème</h2>
        <p className="text-xl text-muted-foreground">
          Les écoles africaines francophones font face à des défis majeurs
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {problems.map((problem, index) => (
          <div
            key={index}
            className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-all animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <problem.icon className="h-12 w-12 text-primary mb-6" />
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground">
                {problem.title}
              </h3>
              <div className="text-4xl font-bold text-primary">
                {problem.stat}
              </div>
              <p className="text-lg text-muted-foreground">
                {problem.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-lg text-center font-semibold text-destructive">
          💡 Marché de 250M€ en Afrique francophone sans solution adaptée
        </p>
      </div>
    </div>
  );
};
