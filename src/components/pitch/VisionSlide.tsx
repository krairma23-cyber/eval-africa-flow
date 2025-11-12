export const VisionSlide = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-12 max-w-5xl">
        <div className="space-y-6">
          <h2 className="text-6xl font-bold text-foreground animate-slide-up">
            Notre Vision
          </h2>
          <p className="text-3xl text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
            Devenir le <span className="text-primary font-bold">système d'exploitation de l'éducation africaine</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-16">
          <div className="bg-card p-8 rounded-xl border-2 border-primary/30 hover:border-primary transition-all animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Phase 1</h3>
            <p className="text-lg text-muted-foreground mb-2">2025-2027</p>
            <p className="text-sm text-muted-foreground">
              Dominer l'Afrique francophone avec 1650+ écoles
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl border-2 border-secondary/30 hover:border-secondary transition-all animate-slide-up" style={{ animationDelay: "300ms" }}>
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Phase 2</h3>
            <p className="text-lg text-muted-foreground mb-2">2027-2029</p>
            <p className="text-sm text-muted-foreground">
              Écosystème EdTech complet : LMS, marketplace, certifications
            </p>
          </div>

          <div className="bg-card p-8 rounded-xl border-2 border-border hover:border-primary transition-all animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Phase 3</h3>
            <p className="text-lg text-muted-foreground mb-2">2029+</p>
            <p className="text-sm text-muted-foreground">
              Expansion panafricaine (anglophone) + universités
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl border-2 border-primary/30">
          <h3 className="text-2xl font-bold text-foreground mb-4">Impact Social</h3>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10M+</div>
              <div className="text-sm text-muted-foreground">Élèves impactés d'ici 2030</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">-50%</div>
              <div className="text-sm text-muted-foreground">Réduction échec scolaire</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-sm text-muted-foreground">Emplois créés</div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <blockquote className="text-2xl italic text-muted-foreground">
            "L'éducation est l'arme la plus puissante pour changer le monde."
          </blockquote>
          <p className="text-lg text-muted-foreground mt-4">— Nelson Mandela</p>
        </div>
      </div>
    </div>
  );
};
