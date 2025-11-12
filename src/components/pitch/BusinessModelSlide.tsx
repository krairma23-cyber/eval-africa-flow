export const BusinessModelSlide = () => {
  const plans = [
    {
      name: "Standard",
      price: "29 990 FCFA",
      students: "300",
      features: ["Gestion complète", "Bulletins auto", "Portail parent", "Support email"],
      target: "45% des écoles"
    },
    {
      name: "Professional",
      price: "59 990 FCFA",
      students: "1000",
      features: ["Tout Standard +", "IA Assistant", "Analytics avancés", "API/Webhooks"],
      target: "35% des écoles",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "149 990 FCFA",
      students: "Illimité",
      features: ["Tout Pro +", "Multi-établissements", "Support 24/7", "SLA garanti"],
      target: "20% des écoles"
    }
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Business Model</h2>
        <p className="text-xl text-muted-foreground">
          Modèle SaaS par abonnement avec expansion verticale
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border-2 transition-all animate-slide-up ${
              plan.highlight
                ? "bg-primary/10 border-primary shadow-xl scale-105"
                : "bg-card border-border"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-center mb-6">
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? "text-primary" : "text-foreground"}`}>
                {plan.name}
              </h3>
              <div className={`text-4xl font-bold mb-2 ${plan.highlight ? "text-primary" : "text-foreground"}`}>
                {plan.price}
              </div>
              <div className="text-sm text-muted-foreground">/mois</div>
              <div className="mt-4 p-2 bg-muted rounded-lg">
                <span className="text-sm font-semibold">Jusqu'à {plan.students} élèves</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className={plan.highlight ? "text-primary" : "text-muted-foreground"}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className={`pt-4 border-t ${plan.highlight ? "border-primary/30" : "border-border"} text-center`}>
              <span className="text-xs font-semibold text-muted-foreground">
                {plan.target}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-xl font-bold mb-6 text-foreground">Économie Unitaire (Plan Pro)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Prix mensuel</span>
              <span className="font-bold text-lg">59 990 FCFA</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Coûts variables</span>
              <span className="font-bold text-lg text-destructive">-8 500 FCFA</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <span className="font-semibold">Marge brute</span>
              <span className="font-bold text-2xl text-primary">51 490 FCFA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Marge brute %</span>
              <span className="font-bold text-primary">85.8%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">Métriques Clés</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">CAC (Customer Acquisition Cost)</span>
                <span className="font-bold text-foreground">85 000 FCFA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">LTV (Lifetime Value 36 mois)</span>
                <span className="font-bold text-primary">1 853 640 FCFA</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="font-semibold">Ratio LTV:CAC</span>
                <span className="font-bold text-2xl text-primary">21.8:1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payback period</span>
                <span className="font-bold text-foreground">1.7 mois</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-xl border border-primary/30">
            <h3 className="text-lg font-bold mb-3 text-primary">🚀 Revenus Additionnels</h3>
            <ul className="space-y-2 text-sm">
              <li>• Formation (50K FCFA/jour)</li>
              <li>• Migration données (100-500K)</li>
              <li>• Personnalisation avancée</li>
              <li>• Stockage additionnel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
