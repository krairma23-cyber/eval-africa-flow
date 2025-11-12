import { Button } from "@/components/ui/button";
import { Info, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
export const AboutEvalScol = () => {
  const navigate = useNavigate();
  return <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate("/about")}>
        <Info className="h-5 w-5" />
        À propos d'EvalScol
      </Button>
      
      <Button size="lg" className="gap-2" onClick={() => navigate("/pricing")}>
        <Sparkles className="h-5 w-5" />
        Voir les Tarifs
      </Button>

      
    </div>;
};