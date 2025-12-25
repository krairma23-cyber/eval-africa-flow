import christmasImage from "@/assets/christmas-evalscol.png";

export const ChristmasBanner = () => {
  return (
    <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 py-6 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-[10%] text-2xl">🎄</div>
        <div className="absolute top-2 left-[30%] text-xl">⭐</div>
        <div className="absolute top-2 left-[50%] text-2xl">🎁</div>
        <div className="absolute top-2 left-[70%] text-xl">✨</div>
        <div className="absolute top-2 left-[90%] text-2xl">🎄</div>
      </div>
      <div className="relative z-10 max-w-md mx-auto">
        <img 
          src={christmasImage} 
          alt="EvalScol Africa vous souhaite un Joyeux Noël" 
          className="w-full max-w-sm mx-auto rounded-2xl shadow-xl mb-4"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Toute l'équipe EvalScol Africa vous souhaite d'excellentes fêtes de fin d'année ! ✨
        </p>
      </div>
    </div>
  );
};
