import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, School, Pencil, Users, TrendingUp } from "lucide-react";
import { AddClassroomDialog } from "@/components/forms/AddClassroomDialog";
import { EditClassroomDialog } from "@/components/forms/EditClassroomDialog";
import { ViewClassStudentsDialog } from "@/components/forms/ViewClassStudentsDialog";
import { ViewClassRankingsDialog } from "@/components/forms/ViewClassRankingsDialog";
import { logError } from "@/lib/logger";

// Fonction pour obtenir l'ordre du niveau scolaire
const getGradeLevelOrder = (gradeName: string): number => {
  const name = gradeName.toLowerCase();
  if (name.includes('cp')) return 1;
  if (name.includes('ce1')) return 2;
  if (name.includes('ce2')) return 3;
  if (name.includes('cm1')) return 4;
  if (name.includes('cm2')) return 5;
  if (name.includes('6') || name.includes('sixième')) return 6;
  if (name.includes('5') || name.includes('cinquième')) return 7;
  if (name.includes('4') || name.includes('quatrième')) return 8;
  if (name.includes('3') || name.includes('troisième')) return 9;
  if (name.includes('2') || name.includes('seconde')) return 10;
  if (name.includes('1') || name.includes('première')) return 11;
  if (name.includes('terminale')) return 12;
  return 999; // Niveaux inconnus à la fin
};

// Fonction pour obtenir la couleur selon le niveau
const getGradeLevelColor = (gradeName: string): string => {
  const name = gradeName.toLowerCase();
  if (name.includes('cp')) return 'hsl(var(--grade-cp))';
  if (name.includes('ce1')) return 'hsl(var(--grade-ce1))';
  if (name.includes('ce2')) return 'hsl(var(--grade-ce2))';
  if (name.includes('cm1')) return 'hsl(var(--grade-cm1))';
  if (name.includes('cm2')) return 'hsl(var(--grade-cm2))';
  if (name.includes('6') || name.includes('sixième')) return 'hsl(var(--grade-6))';
  if (name.includes('5') || name.includes('cinquième')) return 'hsl(var(--grade-5))';
  if (name.includes('4') || name.includes('quatrième')) return 'hsl(var(--grade-4))';
  if (name.includes('3') || name.includes('troisième')) return 'hsl(var(--grade-3))';
  if (name.includes('2') || name.includes('seconde')) return 'hsl(var(--grade-2nd))';
  if (name.includes('1') || name.includes('première')) return 'hsl(var(--grade-1st))';
  if (name.includes('terminale')) return 'hsl(var(--grade-term))';
  return 'hsl(var(--primary))';
};

interface Classroom {
  id: string;
  name: string;
  campus_id: string;
  grade_level_id: string;
  academic_year_id: string;
  capacity: number;
  color: string;
  created_at: string;
  grade_levels: {
    name: string;
  };
  academic_years: {
    name: string;
  };
  enrollments: Array<{
    id: string;
  }>;
  classroom_subjects: Array<{
    id: string;
    subjects: {
      name: string;
    };
  }>;
}

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const classroomRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (highlight && classrooms.length > 0) {
      setHighlightedId(highlight);
      setTimeout(() => {
        const element = classroomRefs.current[highlight];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Remove highlight after animation
          setTimeout(() => {
            setHighlightedId(null);
            setSearchParams({}, { replace: true });
          }, 3000);
        }
      }, 100);
    }
  }, [classrooms, searchParams]);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("classrooms")
        .select(`
          *,
          grade_levels(name),
          academic_years(name),
          enrollments(id),
          classroom_subjects(
            id,
            subjects(name)
          )
        `)
        .order("name");

      if (error) throw error;
      setClassrooms(data || []);
    } catch (error) {
      await logError('Failed to fetch classrooms', error, {
        component: 'Classrooms',
        action: 'FETCH_CLASSROOMS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClassrooms = classrooms
    .filter((classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.grade_levels.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Tri par niveau scolaire d'abord
      const orderA = getGradeLevelOrder(a.grade_levels.name);
      const orderB = getGradeLevelOrder(b.grade_levels.name);
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Ensuite par nom de classe (ex: 6ème A avant 6ème B)
      return a.name.localeCompare(b.name, 'fr');
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
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
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Classes</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gérez les classes de votre établissement
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddClassroomDialog onClassroomAdded={fetchClassrooms}>
          <Button className="w-full sm:w-auto text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une classe
          </Button>
        </AddClassroomDialog>
      </div>

      {filteredClassrooms.length === 0 ? (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune classe trouvée</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Aucune classe ne correspond à votre recherche" : "Commencez par créer votre première classe"}
          </p>
          <AddClassroomDialog onClassroomAdded={fetchClassrooms}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer une classe
            </Button>
          </AddClassroomDialog>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClassrooms.map((classroom) => {
            const classroomColor = classroom.color || getGradeLevelColor(classroom.grade_levels.name);
            const isHighlighted = highlightedId === classroom.id;
            return (
            <Card 
              key={classroom.id}
              ref={(el) => (classroomRefs.current[classroom.id] = el)}
              className={`hover:shadow-md transition-all border-l-4 ${
                isHighlighted ? "ring-2 ring-primary ring-offset-2 shadow-lg animate-pulse" : ""
              }`}
              style={{ borderLeftColor: classroomColor }}
            >
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: classroomColor }}
                    />
                    <span className="truncate">{classroom.name}</span>
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    <EditClassroomDialog
                      classroom={{
                        id: classroom.id,
                        name: classroom.name,
                        campus_id: classroom.campus_id,
                        grade_level_id: classroom.grade_level_id,
                        academic_year_id: classroom.academic_year_id,
                        capacity: classroom.capacity,
                        color: classroom.color,
                      }}
                      onClassroomUpdated={fetchClassrooms}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </EditClassroomDialog>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{ 
                      borderColor: classroomColor,
                      color: classroomColor 
                    }}
                  >
                    {classroom.grade_levels.name}
                  </Badge>
                  <span className="mx-1 sm:mx-2">•</span>
                  <span className="text-xs">{classroom.academic_years.name}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Élèves inscrits:</span>
                  <Badge variant="outline" className="text-xs">{classroom.enrollments?.length || 0} / {classroom.capacity}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2">
                  <ViewClassStudentsDialog classroomId={classroom.id} classroomName={classroom.name}>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs px-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Élèves</span>
                    </Button>
                  </ViewClassStudentsDialog>
                  <ViewClassRankingsDialog classroomId={classroom.id} classroomName={classroom.name}>
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs px-2">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Classement</span>
                    </Button>
                  </ViewClassRankingsDialog>
                </div>
                {classroom.classroom_subjects && classroom.classroom_subjects.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Matières:</span>
                    <div className="flex flex-wrap gap-1">
                      {classroom.classroom_subjects.slice(0, 3).map((cs) => (
                        <Badge key={cs.id} variant="secondary" className="text-xs">
                          {cs.subjects.name}
                        </Badge>
                      ))}
                      {classroom.classroom_subjects.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{classroom.classroom_subjects.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Créée le {formatDate(classroom.created_at)}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}