import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddAssessmentTypeDialog } from "@/components/forms/AddAssessmentTypeDialog";
import { EditAssessmentTypeDialog } from "@/components/forms/EditAssessmentTypeDialog";

interface AssessmentType {
  id: string;
  name: string;
  description: string | null;
  default_coefficient: number;
  school_id: string;
}

export default function AssessmentTypes() {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessmentTypes();
  }, []);

  const fetchAssessmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAssessmentTypes(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les types d'évaluation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('exam') || lowerName.includes('examen')) return 'destructive';
    if (lowerName.includes('contrôle') || lowerName.includes('quiz')) return 'secondary';
    if (lowerName.includes('devoir') || lowerName.includes('homework')) return 'outline';
    return 'default';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            Types d'évaluation
          </h1>
          <p className="text-muted-foreground">
            Gestion des types d'évaluations (Devoirs, Contrôles, Examens, etc.)
          </p>
        </div>
        <AddAssessmentTypeDialog onAssessmentTypeAdded={fetchAssessmentTypes}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un type
          </Button>
        </AddAssessmentTypeDialog>
      </div>

      {assessmentTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun type d'évaluation trouvé</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par ajouter des types d'évaluation (Devoir, Contrôle, Examen, etc.)
            </p>
            <AddAssessmentTypeDialog onAssessmentTypeAdded={fetchAssessmentTypes}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier type
              </Button>
            </AddAssessmentTypeDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessmentTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{type.name}</span>
                  <Badge variant={getTypeColor(type.name)}>
                    Type
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {type.description && (
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                )}
                <p className="text-sm">
                  <strong>Coefficient par défaut:</strong> {type.default_coefficient}
                </p>
                <div className="pt-2">
                  <EditAssessmentTypeDialog 
                    assessmentType={type} 
                    onAssessmentTypeUpdated={fetchAssessmentTypes}
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Modifier
                    </Button>
                  </EditAssessmentTypeDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
