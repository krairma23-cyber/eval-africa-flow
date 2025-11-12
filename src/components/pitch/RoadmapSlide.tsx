export const RoadmapSlide = () => {
  const roadmap = [
    {
      phase: "Q1-Q2 2025",
      status: "En cours",
      items: [
        { title: "Application mobile native", desc: "iOS + Android", priority: "P0" },
        { title: "Module bibliothèque", desc: "Gestion livres & emprunts", priority: "P1" },
        { title: "Module cantine", desc: "Menus & paiements repas", priority: "P1" },
        { title: "SMS automatiques", desc: "Notifications parents", priority: "P0" },
        { title: "QR Code présences", desc: "Check-in élèves", priority: "P2" }
      ]
    },
    {
      phase: "Q3-Q4 2025",
      status: "Planifié",
      items: [
        { title: "Visioconférence intégrée", desc: "Cours en ligne", priority: "P0" },
        { title: "Examens officiels", desc: "BEPC, BAC workflows", priority: "P1" },
        { title: "Plateforme LMS", desc: "Contenus pédagogiques", priority: "P1" },
        { title: "Module paie", desc: "Gestion salaires enseignants", priority: "P2" },
        { title: "Comptabilité avancée", desc: "Intégration ERP", priority: "P2" }
      ]
    },
    {
      phase: "2026+",
      status: "Vision",
      items: [
        { title: "IA prédictive avancée", desc: "Prédiction réussite examens", priority: "P0" },
        { title: "Recommandations personnalisées", desc: "Parcours apprentissage adaptatif", priority: "P1" },
        { title: "Marketplace contenus", desc: "Achat/vente ressources pédago", priority: "P1" },
        { title: "Réseau établissements", desc: "Collaboration inter-écoles", priority: "P2" },
        { title: "Blockchain diplômes", desc: "Certification infalsifiable", priority: "P2" }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0": return "bg-destructive/20 text-destructive border-destructive/30";
      case "P1": return "bg-primary/20 text-primary border-primary/30";
      case "P2": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted";
    }
  };

  return (
    <div className="h-full flex flex-col p-16 bg-background">
      <div className="mb-8">
        <h2 className="text-5xl font-bold text-foreground mb-4">Product Roadmap</h2>
        <p className="text-xl text-muted-foreground">
          Vision 18 mois : De la gestion scolaire à l'écosystème EdTech complet
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        {roadmap.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="flex flex-col">
            <div className={`p-4 rounded-t-xl border-b-4 ${
              phase.status === "En cours" ? "bg-primary/20 border-primary" :
              phase.status === "Planifié" ? "bg-secondary/20 border-secondary" :
              "bg-muted border-muted-foreground"
            }`}>
              <h3 className="text-xl font-bold text-foreground">{phase.phase}</h3>
              <span className={`text-sm font-semibold ${
                phase.status === "En cours" ? "text-primary" :
                phase.status === "Planifié" ? "text-secondary" :
                "text-muted-foreground"
              }`}>
                {phase.status}
              </span>
            </div>

            <div className="flex-1 bg-card rounded-b-xl border border-t-0 border-border p-4 space-y-3">
              {phase.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`p-3 rounded-lg border ${getPriorityColor(item.priority)} animate-slide-up`}
                  style={{ animationDelay: `${(phaseIndex * 5 + itemIndex) * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <span className="text-xs font-mono px-2 py-0.5 bg-background/50 rounded">
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs opacity-80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 bg-destructive/10 border-2 border-destructive/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="font-bold text-sm">P0 - Critique</span>
          </div>
          <p className="text-xs text-muted-foreground">Essentiel croissance, revenu direct</p>
        </div>
        <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="font-bold text-sm">P1 - Important</span>
          </div>
          <p className="text-xs text-muted-foreground">Différenciation compétitive</p>
        </div>
        <div className="p-4 bg-muted border-2 border-border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
            <span className="font-bold text-sm">P2 - Nice-to-have</span>
          </div>
          <p className="text-xs text-muted-foreground">Expansion future, opportuniste</p>
        </div>
      </div>
    </div>
  );
};
