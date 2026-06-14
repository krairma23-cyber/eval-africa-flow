import { AlertTriangle } from "lucide-react";
import { getAppEnv } from "@/lib/env";

/**
 * Visual banner shown on every page when the app runs outside of production.
 * Prevents testers from confusing the staging or dev environment with the
 * real platform serving live schools.
 */
export default function EnvironmentBanner() {
  const env = getAppEnv();
  if (env === "production") return null;

  const isStaging = env === "staging";
  const label = isStaging ? "STAGING — données de test" : "DEV — bac à sable";
  const bg = isStaging ? "bg-orange-500" : "bg-amber-400";
  const fg = isStaging ? "text-white" : "text-amber-950";

  return (
    <div
      className={`${bg} ${fg} w-full text-center text-xs font-semibold py-1.5 px-3 flex items-center justify-center gap-2 sticky top-0 z-[100] shadow-sm`}
      role="status"
      aria-label={`Environnement ${env}`}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      <span>{label} · ne contient PAS de données réelles d'écoles</span>
    </div>
  );
}
