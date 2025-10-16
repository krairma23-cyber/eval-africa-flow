import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, School, Calendar, Pencil, Users } from "lucide-react";
import { AddClassroomDialog } from "@/components/forms/AddClassroomDialog";
import { EditClassroomDialog } from "@/components/forms/EditClassroomDialog";
import { ViewClassStudentsDialog } from "@/components/forms/ViewClassStudentsDialog";
import { logError } from "@/lib/logger";

// Fonction pour obtenir la couleur selon le niveau
const getGradeLevelColor = (gradeName: string): string => {
  const name = gradeName.toLowerCase();
  
  // Primaire
  if (name.includes('cp')) return 'hsl(var(--grade-cp))';
  if (name.includes('ce1')) return 'hsl(var(--grade-ce1))';
  if (name.includes('ce2')) return 'hsl(var(--grade-ce2))';
  if (name.includes('cm1')) return 'hsl(var(--grade-cm1))';
  if (name.includes('cm2')) return 'hsl(var(--grade-cm2))';
  
  // Lycée - vérifier en premier les noms complets
  if (name.includes('terminale') || name.includes('term')) return 'hsl(var(--grade-term))';
  if (name.includes('première') || name.includes('1ère') || name === '1ère' || name === 'première') return 'hsl(var(--grade-1st))';
  if (name.includes('seconde') || name.includes('2nde') || name === '2nde' || name === 'seconde') return 'hsl(var(--grade-2nd))';
  
  // Collège - vérifier les noms complets avant les chiffres
  if (name.includes('sixième') || name === '6ème' || name === 'sixième') return 'hsl(var(--grade-6))';
  if (name.includes('cinquième') || name === '5ème' || name === 'cinquième') return 'hsl(var(--grade-5))';
  if (name.includes('quatrième') || name === '4ème' || name === 'quatrième') return 'hsl(var(--grade-4))';
  if (name.includes('troisième') || name === '3ème' || name === 'troisième') return 'hsl(var(--grade-3))';
  
  // Fallback pour les chiffres seuls (si le nom n'est que le chiffre)
  if (name === '6') return 'hsl(var(--grade-6))';
  if (name === '5') return 'hsl(var(--grade-5))';
  if (name === '4') return 'hsl(var(--grade-4))';
  if (name === '3') return 'hsl(var(--grade-3))';
  
  return 'hsl(var(--primary))';
};

interface Classroom {
  id: string;
  name: string;
  campus_id: string;
  grade_level_id: string;
  academic_year_id: string;
  capacity: number;
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
  const { toast } = useToast();

  useEffect(() => {
    fetchClassrooms();
  }, []);

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

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.grade_levels.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <p className="text-muted-foreground">
          Gérez les classes de votre établissement
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <AddClassroomDialog onClassroomAdded={fetchClassrooms}>
          <Button>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClassrooms.map((classroom) => {
            const gradeColor = getGradeLevelColor(classroom.grade_levels.name);
            return (
            <Card 
              key={classroom.id} 
              className="hover:shadow-md transition-shadow border-l-4" 
              style={{ borderLeftColor: gradeColor }}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: gradeColor }}
                    />
                    {classroom.name}
                  </span>
                  <div className="flex gap-2">
                    <EditClassroomDialog
                      classroom={{
                        id: classroom.id,
                        name: classroom.name,
                        campus_id: classroom.campus_id,
                        grade_level_id: classroom.grade_level_id,
                        academic_year_id: classroom.academic_year_id,
                        capacity: classroom.capacity,
                      }}
                      onClassroomUpdated={fetchClassrooms}
                    >
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </EditClassroomDialog>
                  </div>
                </CardTitle>
                <CardDescription>
                  <Badge 
                    variant="outline" 
                    style={{ 
                      borderColor: gradeColor,
                      color: gradeColor 
                    }}
                  >
                    {classroom.grade_levels.name}
                  </Badge>
                  <span className="mx-2">•</span>
                  {classroom.academic_years.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Élèves inscrits:</span>
                  <Badge variant="outline">{classroom.enrollments?.length || 0} / {classroom.capacity}</Badge>
                </div>
                <ViewClassStudentsDialog classroomId={classroom.id} classroomName={classroom.name}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Users className="h-4 w-4 mr-2" />
                    Voir les élèves
                  </Button>
                </ViewClassStudentsDialog>
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