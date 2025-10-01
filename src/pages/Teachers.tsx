import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, GraduationCap, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTeacherDialog } from "@/components/forms/AddTeacherDialog";
import { logError } from "@/lib/logger";

interface Teacher {
  id: string;
  teacher_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  hire_date: string;
  created_at: string;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        await logError('Failed to fetch teachers', error, {
          component: 'Teachers',
          action: 'FETCH_TEACHERS'
        });
        toast({
          title: "Erreur",
          description: "Impossible de charger les enseignants",
          variant: "destructive",
        });
      } else {
        setTeachers(data || []);
        
        // Log audit trail for teacher data access
        if (data && data.length > 0) {
          await supabase.from('comprehensive_audit_logs').insert({
            action: 'VIEW_TEACHERS_LIST',
            resource_type: 'teachers',
            request_data: { count: data.length },
            success: true
          });
        }
      }
    } catch (error) {
      await logError('Unexpected error fetching teachers', error, {
        component: 'Teachers',
        action: 'FETCH_TEACHERS'
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

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.specialization && teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <Skeleton key={i} className="h-48 w-full" />
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
            <GraduationCap className="h-8 w-8" />
            Enseignants
          </h1>
          <p className="text-muted-foreground">
            Gestion du personnel enseignant
          </p>
        </div>
        <AddTeacherDialog onTeacherAdded={fetchTeachers}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un enseignant
          </Button>
        </AddTeacherDialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un enseignant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredTeachers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun enseignant trouvé</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Aucun enseignant ne correspond à votre recherche"
                : "Commencez par ajouter des enseignants à votre établissement"}
            </p>
            {!searchTerm && (
              <AddTeacherDialog onTeacherAdded={fetchTeachers}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le premier enseignant
                </Button>
              </AddTeacherDialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{teacher.first_name} {teacher.last_name}</span>
                  {teacher.specialization && (
                    <Badge variant="secondary">{teacher.specialization}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  N° enseignant: {teacher.teacher_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {teacher.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{teacher.email}</span>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.hire_date && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Embauché le:</strong> {formatDate(teacher.hire_date)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Ajouté le {formatDate(teacher.created_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}