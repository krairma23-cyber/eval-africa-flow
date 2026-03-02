export const ClosingSlide = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
      <div className="text-center space-y-12 max-w-4xl animate-slide-up">
        <img
          src="/evalscol-logo.png"
          alt="EvalScol Logo"
          className="h-28 mx-auto mb-8"
        />
        
        <h2 className="text-6xl font-bold">
          Rejoignez-nous pour transformer<br />
          l'éducation en Afrique
        </h2>

        <div className="text-2xl opacity-90 leading-relaxed">
          Investissez dans le futur de 10 millions d'élèves africains
        </div>

        <div className="mt-16 space-y-6 text-lg opacity-90">
          <div className="flex items-center justify-center gap-8">
            <div>
              <div className="text-sm opacity-75">Email</div>
              <div className="font-semibold">evalscolafrica@siteteck.com</div>
            </div>
            <div className="border-l border-primary-foreground/30 h-12"></div>
            <div>
              <div className="text-sm opacity-75">Téléphone</div>
              <div className="font-semibold">+225 01 01 82 13 29 / 07 07 04 19 03</div>
            </div>
          </div>

          <div>
            <div className="text-sm opacity-75 mb-2">Website</div>
            <div className="font-semibold text-2xl">evalscolafrica.siteteck.com</div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/30">
          <p className="text-xl font-light opacity-80">
            EvalScol Africa — Made with ❤️ in Africa, for Africa
          </p>
        </div>

        <div className="mt-8">
          <p className="text-sm opacity-75">
            Novembre 2025 • Série A • Confidentiel
          </p>
        </div>
      </div>
    </div>
  );
};
