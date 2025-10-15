import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Calendar, ClipboardList, FileEdit } from "lucide-react";
import { AddAssessmentDialog } from "@/components/forms/AddAssessmentDialog";
import { EnterGradesDialog } from "@/components/forms/EnterGradesDialog";
import { logError } from "@/lib/logger";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessment_date: string;
  max_score: number;
  coefficient: number;
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
  terms: {
    name: string;
    term_number: number;
  };
}

interface GroupedAssessments {
  [termName: string]: Assessment[];
}

export default function ExamSequences() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [gradesDialogOpen, setGradesDialogOpen] = useState(false);
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
          ),
          terms(name, term_number)
        `)
        .order("assessment_date", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      await logError('Failed to fetch exam sequences', error, {
        component: 'ExamSequences',
        action: 'FETCH_ASSESSMENTS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les séquences d'examen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedAssessments: GroupedAssessments = assessments
    .filter((assessment) =>
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.classroom_subjects.subjects.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.classroom_subjects.classrooms.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reduce((acc, assessment) => {
      const termName = assessment.terms.name;
      if (!acc[termName]) {
        acc[termName] = [];
      }
      acc[termName].push(assessment);
      return acc;
    }, {} as GroupedAssessments);

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
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-40" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="h-8 w-8" />
          Séquences d'Examen
        </h1>
        <p className="text-muted-foreground">
          Planifiez et gérez vos séquences d'évaluation par trimestre
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddAssessmentDialog onAssessmentAdded={fetchAssessments}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle évaluation
          </Button>
        </AddAssessmentDialog>
      </div>

      {Object.keys(groupedAssessments).length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune séquence d'examen trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Aucune évaluation ne correspond à votre recherche" : "Commencez par créer vos premières évaluations"}
          </p>
          <AddAssessmentDialog onAssessmentAdded={fetchAssessments}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer une évaluation
            </Button>
          </AddAssessmentDialog>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAssessments)
            .sort(([, a], [, b]) => b[0].terms.term_number - a[0].terms.term_number)
            .map(([termName, termAssessments]) => (
              <div key={termName} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-semibold text-foreground">{termName}</h2>
                  <Badge variant="secondary">
                    {termAssessments.length} évaluation{termAssessments.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {termAssessments.map((assessment) => (
                    <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2">
                          <span className="truncate">{assessment.title}</span>
                          <Badge variant={getTypeColor(assessment.assessment_types.name)}>
                            {assessment.assessment_types.name}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {assessment.classroom_subjects.subjects.name} • {assessment.classroom_subjects.classrooms.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(assessment.assessment_date)}
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Note max:</span> {assessment.max_score} points
                          </div>
                          <div>
                            <span className="font-medium">Coefficient:</span> {assessment.coefficient}
                          </div>
                        </div>
                        {assessment.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {assessment.description}
                          </p>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedAssessment(assessment);
                            setGradesDialogOpen(true);
                          }}
                        >
                          <FileEdit className="h-4 w-4 mr-2" />
                          Saisir les notes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {selectedAssessment && (
        <EnterGradesDialog
          assessmentId={selectedAssessment.id}
          assessmentTitle={selectedAssessment.title}
          maxScore={selectedAssessment.max_score}
          open={gradesDialogOpen}
          onOpenChange={setGradesDialogOpen}
        />
      )}
    </div>
  );
}
