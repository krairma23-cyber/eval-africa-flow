import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, School, Calendar } from "lucide-react";
import { AddClassroomDialog } from "@/components/forms/AddClassroomDialog";

interface Classroom {
  id: string;
  name: string;
  created_at: string;
  grade_levels: {
    name: string;
  };
  academic_years: {
    name: string;
  };
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
          academic_years(name)
        `)
        .order("name");

      if (error) throw error;
      setClassrooms(data || []);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
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
          {filteredClassrooms.map((classroom) => (
            <Card key={classroom.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{classroom.name}</span>
                  <School className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Niveau {classroom.grade_levels.name} • {classroom.academic_years.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Créée le {formatDate(classroom.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}