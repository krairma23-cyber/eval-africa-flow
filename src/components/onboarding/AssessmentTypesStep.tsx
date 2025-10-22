import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClipboardCheck, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AssessmentTypesStepProps {
  onNext: () => void;
  onBack: () => void;
  schoolData: any;
}

const DEFAULT_ASSESSMENT_TYPES = [
  { name: "Contrôle Continu", description: "Évaluations régulières", coefficient: 1 },
  { name: "Devoir Surveillé", description: "Évaluations en classe", coefficient: 2 },
  { name: "Examen", description: "Évaluations de fin de période", coefficient: 3 },
  { name: "Oral", description: "Évaluations orales", coefficient: 1.5 },
  { name: "Projet", description: "Travaux de groupe ou individuels", coefficient: 2 },
];

export function AssessmentTypesStep({ onNext, onBack, schoolData }: AssessmentTypesStepProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    DEFAULT_ASSESSMENT_TYPES.map(t => t.name)
  );
  const { toast } = useToast();

  const handleTypeToggle = (typeName: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeName)
        ? prev.filter(t => t !== typeName)
        : [...prev, typeName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTypes.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un type d'évaluation",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create assessment types
      for (const typeName of selectedTypes) {
        const type = DEFAULT_ASSESSMENT_TYPES.find(t => t.name === typeName);
        if (!type) continue;

        const { error } = await supabase
          .from("assessment_types")
          .insert({
            school_id: schoolData.id,
            name: type.name,
            description: type.description,
            default_coefficient: type.coefficient,
          });

        if (error) throw error;
      }

      toast({
        title: "Types d'évaluation créés",
        description: "Les types d'évaluation ont été configurés",
      });
      onNext();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <ClipboardCheck className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Types d'évaluations</h2>
        <p className="text-muted-foreground mt-2">
          Sélectionnez les types d'évaluations que vous utiliserez
        </p>
      </div>

      <div className="space-y-3">
        {DEFAULT_ASSESSMENT_TYPES.map((type) => (
          <div key={type.name} className="flex items-start space-x-3 p-4 rounded-lg border bg-card">
            <Checkbox
              id={type.name}
              checked={selectedTypes.includes(type.name)}
              onCheckedChange={() => handleTypeToggle(type.name)}
            />
            <div className="flex-1">
              <label htmlFor={type.name} className="font-medium cursor-pointer block">
                {type.name}
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                {type.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coefficient par défaut: {type.coefficient}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Configuration..." : "Continuer"}
        </Button>
      </div>
    </form>
  );
}