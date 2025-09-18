import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ClipboardCheck, Calendar } from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessment_date: string;
  max_score: number;
  created_at: string;
  assessment_types: {
    name: string;
  };
  classroom_subjects: {
    subjects: {
      name: string;
    };
    classrooms: {
      name: string;
    };
  };
}

export default function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("assessments")
        .select(`
          *,
          assessment_types(name),
          classroom_subjects(
            subjects(name),
            classrooms(name)
          )
        `)
        .order("assessment_date", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les évaluations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter((assessment) =>
    assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.classroom_subjects.subjects.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.classroom_subjects.classrooms.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "exam":
      case "examen":
        return "destructive";
      case "quiz":
      case "contrôle":
        return "secondary";
      case "homework":
      case "devoir":
        return "outline";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type: string) => {
    return type;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Évaluations</h1>
        <p className="text-muted-foreground">
          Gérez les évaluations et contrôles de vos classes
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une évaluation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Créer une évaluation
        </Button>
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune évaluation trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Aucune évaluation ne correspond à votre recherche" : "Commencez par créer votre première évaluation"}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer une évaluation
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{assessment.title}</span>
                  <Badge variant={getTypeColor(assessment.assessment_types.name)}>
                    {getTypeLabel(assessment.assessment_types.name)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {assessment.classroom_subjects.subjects.name} • {assessment.classroom_subjects.classrooms.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(assessment.assessment_date)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Note max:</span> {assessment.max_score} points
                </div>
                {assessment.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {assessment.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}