import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, BookOpen, Calendar, Pencil, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AddSubjectDialog } from "@/components/forms/AddSubjectDialog";
import { EditSubjectDialog } from "@/components/forms/EditSubjectDialog";
import { logError } from "@/lib/logger";

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  created_at: string;
  classroom_subjects?: Array<{
    classrooms: {
      id: string;
      name: string;
    };
  }>;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          classroom_subjects(
            classrooms(
              id,
              name
            )
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        await logError('Failed to fetch subjects', error, {
          component: 'Subjects',
          action: 'FETCH_SUBJECTS'
        });
        toast({
          title: "Erreur",
          description: "Impossible de charger les matières",
          variant: "destructive",
        });
      } else {
        setSubjects(data || []);
      }
    } catch (error) {
      await logError('Unexpected error fetching subjects', error, {
        component: 'Subjects',
        action: 'FETCH_SUBJECTS'
      });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClassroom = selectedClassroom === "all" || 
      subject.classroom_subjects?.some(cs => cs.classrooms.id === selectedClassroom);
    
    return matchesSearch && matchesClassroom;
  });

  const subjectsByClassroom = filteredSubjects.reduce((acc, subject) => {
    if (subject.classroom_subjects && subject.classroom_subjects.length > 0) {
      subject.classroom_subjects.forEach(cs => {
        const classroomName = cs.classrooms.name;
        if (!acc[classroomName]) {
          acc[classroomName] = [];
        }
        if (!acc[classroomName].some(s => s.id === subject.id)) {
          acc[classroomName].push(subject);
        }
      });
    } else {
      if (!acc["Non assignées"]) {
        acc["Non assignées"] = [];
      }
      acc["Non assignées"].push(subject);
    }
    return acc;
  }, {} as Record<string, Subject[]>);

  const uniqueClassrooms = Array.from(
    new Set(
      subjects.flatMap(subject => 
        subject.classroom_subjects?.map(cs => ({
          id: cs.classrooms.id,
          name: cs.classrooms.name
        })) || []
      ).map(c => JSON.stringify(c))
    )
  ).map(c => JSON.parse(c)).sort((a, b) => a.name.localeCompare(b.name));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-10 w-full max-w-sm" />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
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
            <BookOpen className="h-8 w-8" />
            Matières
          </h1>
          <p className="text-muted-foreground">
            Gestion des matières enseignées
          </p>
        </div>
        <AddSubjectDialog onSubjectAdded={fetchSubjects}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une matière
          </Button>
        </AddSubjectDialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une matière..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Filtrer par classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {uniqueClassrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredSubjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune matière trouvée</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || selectedClassroom !== "all"
                ? "Aucune matière ne correspond à votre recherche"
                : "Commencez par ajouter des matières à votre établissement"}
            </p>
            {!searchTerm && selectedClassroom === "all" && (
              <AddSubjectDialog onSubjectAdded={fetchSubjects}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la première matière
                </Button>
              </AddSubjectDialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(subjectsByClassroom).sort(([a], [b]) => {
            if (a === "Non assignées") return 1;
            if (b === "Non assignées") return -1;
            return a.localeCompare(b);
          }).map(([classroomName, classroomSubjects]) => (
            <div key={classroomName} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{classroomName}</h2>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {classroomSubjects.length} {classroomSubjects.length === 1 ? 'matière' : 'matières'}
                </Badge>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classroomSubjects.map((subject) => (
                  <Card key={subject.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{subject.name}</span>
                        <div className="flex gap-2 items-center">
                          <Badge variant="outline">{subject.code}</Badge>
                          <EditSubjectDialog
                            subject={{
                              id: subject.id,
                              name: subject.name,
                              code: subject.code,
                              description: subject.description,
                            }}
                            onSubjectUpdated={fetchSubjects}
                          >
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </EditSubjectDialog>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {subject.description || "Aucune description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Créée le {formatDate(subject.created_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}