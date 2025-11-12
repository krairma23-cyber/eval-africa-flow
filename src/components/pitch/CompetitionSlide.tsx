export const CompetitionSlide = () => {
  const competitors = [
    { name: "EvalScol", ai: true, mobile: true, payments: true, price: "✓✓✓", africa: true, ease: true },
    { name: "Concurrents Internationaux", ai: false, mobile: true, payments: false, price: "✗", africa: false, ease: false },
    { name: "Solutions On-Premise", ai: false, mobile: false, payments: false, price: "✗✗", africa: false, ease: false },
    { name: "Outils Excel/Word", ai: false, mobile: false, payments: false, price: "✓", africa: true, ease: false },
  ];

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Analyse Concurrentielle</h2>
        <p className="text-xl text-muted-foreground">
          First-mover avec différenciation IA forte
        </p>
      </div>

      <div className="flex-1 space-y-8">
        {/* Comparison Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-bold">Solution</th>
                <th className="text-center p-4">IA Native</th>
                <th className="text-center p-4">Mobile Money</th>
                <th className="text-center p-4">Paiements</th>
                <th className="text-center p-4">Prix Adapté</th>
                <th className="text-center p-4">Focus Afrique</th>
                <th className="text-center p-4">Facilité</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((comp, index) => (
                <tr
                  key={index}
                  className={`border-t border-border ${
                    index === 0 ? "bg-primary/10" : ""
                  }`}
                >
                  <td className="p-4 font-semibold">
                    {comp.name}
                    {index === 0 && <span className="ml-2 text-xs text-primary">(Nous)</span>}
                  </td>
                  <td className="text-center p-4">
                    {comp.ai ? (
                      <span className="text-2xl text-primary">✓</span>
                    ) : (
                      <span className="text-2xl text-muted-foreground">✗</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {comp.mobile ? (
                      <span className="text-2xl text-primary">✓</span>
                    ) : (
                      <span className="text-2xl text-muted-foreground">✗</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {comp.payments ? (
                      <span className="text-2xl text-primary">✓</span>
                    ) : (
                      <span className="text-2xl text-muted-foreground">✗</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    <span className={comp.price.includes("✓") ? "text-primary" : "text-muted-foreground"}>
                      {comp.price}
                    </span>
                  </td>
                  <td className="text-center p-4">
                    {comp.africa ? (
                      <span className="text-2xl text-primary">✓</span>
                    ) : (
                      <span className="text-2xl text-muted-foreground">✗</span>
                    )}
                  </td>
                  <td className="text-center p-4">
                    {comp.ease ? (
                      <span className="text-2xl text-primary">✓</span>
                    ) : (
                      <span className="text-2xl text-muted-foreground">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Competitive Advantages */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-xl border-2 border-primary/30">
            <h3 className="text-xl font-bold mb-4 text-primary">🚀 First-Mover Advantage</h3>
            <ul className="space-y-2 text-sm">
              <li>• Seul SaaS IA pour Afrique francophone</li>
              <li>• 0% pénétration marché actuelle</li>
              <li>• Barrières à l'entrée croissantes (données, ML)</li>
              <li>• Network effects (contenu, intégrations)</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">💡 Innovation Technologique</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• IA générative native (non retro-fit)</li>
              <li>• Stack moderne (React, Supabase, Edge)</li>
              <li>• Optimisé connexions faibles</li>
              <li>• Architecture multi-tenant scalable</li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 text-foreground">🎯 Product-Market Fit</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Conçu PAR et POUR l'Afrique</li>
              <li>• Prix adapté (29K-150K FCFA/mois)</li>
              <li>• Support français & local</li>
              <li>• NPS 92% validation forte</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-primary/10 border-2 border-primary/30 rounded-lg">
        <p className="text-center text-lg font-semibold text-primary">
          💎 Moat technologique : Données propriétaires + Algorithmes ML + Intégrations exclusives (Paystack, EdTech partners)
        </p>
      </div>
    </div>
  );
};
