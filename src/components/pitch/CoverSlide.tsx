export const CoverSlide = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
      <div className="text-center space-y-8 max-w-4xl animate-slide-up">
        <img
          src="/evalscol-logo.png"
          alt="EvalScol Logo"
          className="h-24 mx-auto"
        />
        <h1 className="text-7xl font-bold tracking-tight">
          EvalScol Africa
        </h1>
        <p className="text-3xl font-light opacity-90">
          La Première Plateforme SaaS de Gestion Scolaire<br />
          avec IA Générative pour l'Afrique Francophone
        </p>
        <div className="pt-8 space-y-2">
          <p className="text-xl opacity-80">Pitch Deck Investisseurs</p>
          <p className="text-lg opacity-70">Novembre 2025 • Série A</p>
        </div>
      </div>
    </div>
  );
};
