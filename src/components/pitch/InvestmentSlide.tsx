export const InvestmentSlide = () => {
  const useOfFunds = [
    { category: "Produit & Tech", amount: 350, percent: 35, items: ["3 Engineers", "Infrastructure Cloud", "R&D IA"] },
    { category: "Sales & Marketing", amount: 400, percent: 40, items: ["2 Sales Reps", "Marketing digital", "Événements"] },
    { category: "Customer Success", amount: 150, percent: 15, items: ["2 CS Managers", "Onboarding", "Support"] },
    { category: "Opérations", amount: 100, percent: 10, items: ["Admin", "Légal", "Finance"] },
  ];

  const milestones = [
    { milestone: "120 écoles", timeline: "M+6" },
    { milestone: "500 écoles", timeline: "M+12" },
    { milestone: "Break-even", timeline: "M+18" },
    { milestone: "Série B ready", timeline: "M+24" },
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">The Ask</h2>
        <p className="text-xl text-muted-foreground">
          Série A : 1M€ pour accélérer la croissance et dominer le marché francophone
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Left: Investment Details */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded-xl text-primary-foreground">
            <div className="text-sm opacity-90 mb-2">Levée de fonds Série A</div>
            <div className="text-6xl font-bold mb-4">1 000 000 €</div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <div className="opacity-75">Valorisation pre-money</div>
                <div className="text-xl font-bold">4M€</div>
              </div>
              <div className="border-l border-primary-foreground/30 h-12"></div>
              <div>
                <div className="opacity-75">Dilution</div>
                <div className="text-xl font-bold">20%</div>
              </div>
            </div>
          </div>

          {/* Use of Funds */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-6 text-foreground">Allocation des Fonds</h3>
            <div className="space-y-4">
              {useOfFunds.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">{item.category}</span>
                    <span className="text-lg font-bold text-primary">{item.amount}K€</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {item.items.map((subItem, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                        {subItem}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Milestones & Returns */}
        <div className="space-y-6">
          {/* Key Milestones */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-6 text-foreground">Milestones 24 mois</h3>
            <div className="space-y-4">
              {milestones.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-muted rounded-lg animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-foreground">{item.milestone}</div>
                    <div className="text-sm text-muted-foreground">{item.timeline}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expected Returns */}
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 p-6 rounded-xl border border-secondary/30">
            <h3 className="text-xl font-bold mb-6 text-secondary">📈 Retour sur Investissement</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">142M</div>
                  <div className="text-xs text-muted-foreground">ARR Année 3 (FCFA)</div>
                </div>
                <div className="bg-background/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-foreground mb-1">1650</div>
                  <div className="text-xs text-muted-foreground">Écoles clientes</div>
                </div>
              </div>
              
              <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Valorisation estimée Y3</span>
                  <span className="text-2xl font-bold text-secondary">35-50M€</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Multiple ARR 5-7x (comparable SaaS EdTech)
                </div>
              </div>

              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Multiple sur investissement</span>
                  <span className="text-3xl font-bold text-secondary">7-10x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Investor Benefits */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold mb-4 text-foreground">🎯 Pourquoi investir maintenant ?</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>First-mover :</strong> Marché 250M€ sans concurrent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Traction prouvée :</strong> 45 écoles, 280% MoM growth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Unit economics :</strong> LTV:CAC 21.8:1, marge 85%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Tech moat :</strong> IA propriétaire + données exclusives</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
