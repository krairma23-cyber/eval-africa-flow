import { Gift, Sparkles, TreePine } from "lucide-react";

export const ChristmasBanner = () => {
  return (
    <div className="bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white py-3 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1 left-[10%] text-2xl">🎄</div>
        <div className="absolute top-1 left-[30%] text-xl">⭐</div>
        <div className="absolute top-1 left-[50%] text-2xl">🎁</div>
        <div className="absolute top-1 left-[70%] text-xl">✨</div>
        <div className="absolute top-1 left-[90%] text-2xl">🎄</div>
      </div>
      <div className="flex items-center justify-center gap-3 relative z-10">
        <TreePine className="h-5 w-5 text-green-200 animate-pulse" />
        <span className="font-bold text-lg">
          🎅 Joyeux Noël et Bonnes Fêtes de fin d'année ! 🎄
        </span>
        <Gift className="h-5 w-5 text-yellow-200 animate-bounce" />
      </div>
      <p className="text-sm text-white/90 mt-1 relative z-10">
        Toute l'équipe EvalScol Africa vous souhaite d'excellentes fêtes ✨
      </p>
    </div>
  );
};
