import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ClipboardCheck, Calendar, Pencil, FileEdit, GraduationCap } from "lucide-react";
import { AddAssessmentDialog } from "@/components/forms/AddAssessmentDialog";
import { EditAssessmentDialog } from "@/components/forms/EditAssessmentDialog";
import { EnterGradesDialog } from "@/components/forms/EnterGradesDialog";
import { logError } from "@/lib/logger";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import assessmentsDecor from "@/assets/decor-assessments.jpg";
import { DeleteConfirmButton } from "@/components/shared/DeleteConfirmButton";

interface Assessment {
  id: string;
  title: string;
  description: string | null;
  assessment_type_id: string;
  classroom_subject_id: string;
  term_id: string;
  assessment_date: string;
  max_score: number;
  coefficient: number;
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
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
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
          )
        `)
        .order("assessment_date", { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      await logError('Failed to fetch assessments', error, {
        component: 'Assessments',
        action: 'FETCH_ASSESSMENTS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les évaluations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.classroom_subjects.subjects.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.classroom_subjects.classrooms.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClassroom = selectedClassroom === "all" || 
      assessment.classroom_subjects.classrooms.name === selectedClassroom;
    
    return matchesSearch && matchesClassroom;
  });

  // Group assessments by classroom
  const assessmentsByClassroom = filteredAssessments.reduce((acc, assessment) => {
    const classroomName = assessment.classroom_subjects.classrooms.name;
    if (!acc[classroomName]) {
      acc[classroomName] = [];
    }
    acc[classroomName].push(assessment);
    return acc;
  }, {} as Record<string, Assessment[]>);

  // Get unique classrooms for filter
  const uniqueClassrooms = Array.from(
    new Set(assessments.map(a => a.classroom_subjects.classrooms.name))
  ).sort();

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
    <div className="space-y-4 w-full overflow-x-hidden">
      <PageHeroBanner
        image={assessmentsDecor}
        alt="Illustration crayon coloré et évaluations"
        icon={<ClipboardCheck className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />}
        title="Évaluations"
        subtitle="Gérez les évaluations et contrôles de vos classes"
        action={
          <AddAssessmentDialog onAssessmentAdded={fetchAssessments}>
            <Button className="w-full sm:w-auto flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Créer une évaluation
            </Button>
          </AddAssessmentDialog>
        }
      />


      <div className="flex flex-col gap-3 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une évaluation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:max-w-sm"
          />
        </div>
        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {uniqueClassrooms.map((classroom) => (
              <SelectItem key={classroom} value={classroom}>
                {classroom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredAssessments.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune évaluation trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Aucune évaluation ne correspond à votre recherche" : "Commencez par créer votre première évaluation"}
          </p>
          <AddAssessmentDialog onAssessmentAdded={fetchAssessments}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer une évaluation
            </Button>
          </AddAssessmentDialog>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(assessmentsByClassroom).map(([classroomName, classroomAssessments]) => (
            <div key={classroomName} className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg min-w-0">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <h2 className="text-base sm:text-xl font-semibold truncate">{classroomName}</h2>
                </div>
                <Separator className="flex-1 hidden sm:block" />
                <Badge variant="secondary" className="px-2 py-1 text-xs ml-auto flex-shrink-0">
                  {classroomAssessments.length} évaluation{classroomAssessments.length > 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {classroomAssessments.map((assessment) => (
                  <Card key={assessment.id} className="hover:shadow-md transition-shadow overflow-hidden">
                    <CardHeader className="p-3 sm:p-4">
                      <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg">
                        <span className="truncate">{assessment.title}</span>
                        <div className="flex gap-1 items-center flex-shrink-0">
                          <Badge variant={getTypeColor(assessment.assessment_types.name)} className="text-xs">
                            {getTypeLabel(assessment.assessment_types.name)}
                          </Badge>
                          <EditAssessmentDialog
                            assessment={{
                              id: assessment.id,
                              title: assessment.title,
                              description: assessment.description,
                              assessment_type_id: assessment.assessment_type_id,
                              classroom_subject_id: assessment.classroom_subject_id,
                              term_id: assessment.term_id,
                              assessment_date: assessment.assessment_date,
                              max_score: assessment.max_score,
                              coefficient: assessment.coefficient,
                            }}
                            onAssessmentUpdated={fetchAssessments}
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </EditAssessmentDialog>
                          <DeleteConfirmButton
                            table="assessments"
                            id={assessment.id}
                            itemLabel={`l'évaluation "${assessment.title}"`}
                            description={`Supprimer "${assessment.title}" ? Toutes les notes des élèves associées à cette évaluation seront également supprimées.`}
                            onDeleted={fetchAssessments}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          />
                        </div>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {assessment.classroom_subjects.subjects.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        {formatDate(assessment.assessment_date)}
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="font-medium">Note max:</span> {assessment.max_score} points
                      </div>
                      {assessment.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {assessment.description}
                        </p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-8"
                        onClick={() => {
                          setSelectedAssessment(assessment);
                          setGradesDialogOpen(true);
                        }}
                      >
                        <FileEdit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
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