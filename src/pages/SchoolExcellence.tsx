import { Trophy } from "lucide-react";
import { SchoolExcellencePanel } from "@/components/excellence/SchoolExcellencePanel";

export default function SchoolExcellence() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Palmarès EvalScol Africa
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">Excellence de votre établissement</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Votre score et votre rang restent privés lorsque votre école est hors du Top 10. Utilisez les indicateurs ci-dessous pour préparer le prochain palmarès.
        </p>
      </div>
      <SchoolExcellencePanel />
    </div>
  );
}
