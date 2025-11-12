export const ProductSlide = () => {
  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Produit</h2>
        <p className="text-xl text-muted-foreground">
          Plateforme complète avec 12+ modules intégrés
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        <div className="col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <img
            src="/placeholder.svg"
            alt="Product Screenshot"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-background/90 rounded-lg backdrop-blur-sm border border-border">
              <p className="text-lg font-semibold text-muted-foreground">
                Capture d'écran Dashboard EvalScol
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Interface moderne • Design responsive • UX optimisée
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="font-bold text-lg mb-4 text-primary">Core Features</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Gestion élèves & enseignants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Évaluations & bulletins automatisés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Portail parent temps réel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Analytics & tableaux de bord</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Emploi du temps & planning</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 rounded-xl border border-primary/30">
            <h3 className="font-bold text-lg mb-4 text-primary">🤖 IA Features</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Génération contenu pédagogique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Détection élèves à risque</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Analyses prédictives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Assistant vocal enseignant</span>
              </li>
            </ul>
          </div>

          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="font-bold text-lg mb-4">💳 Paiements</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Mobile Money intégré</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Suivi automatique des soldes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Reçus PDF automatiques</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">12+</div>
          <div className="text-xs text-muted-foreground">Modules</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">99.9%</div>
          <div className="text-xs text-muted-foreground">Uptime SLA</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">&lt;2s</div>
          <div className="text-xs text-muted-foreground">Page Load</div>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">5 jours</div>
          <div className="text-xs text-muted-foreground">Déploiement</div>
        </div>
      </div>
    </div>
  );
};
