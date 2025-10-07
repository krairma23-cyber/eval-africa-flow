import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, ArrowRightLeft, MapPin, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssignTeacherDialog } from "@/components/forms/AssignTeacherDialog";
import { EnrollStudentDialog } from "@/components/forms/EnrollStudentDialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeacherAssignment {
  id: string;
  teacher: { first_name: string; last_name: string };
  classroom: { name: string };
  subject: { name: string };
  coefficient: number;
}

interface StudentEnrollment {
  id: string;
  student: { first_name: string; last_name: string; student_number: string };
  classroom: { name: string };
  academic_year: { name: string };
  status: string;
  enrollment_date: string;
}

const Assignments = () => {
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"teacher" | "student" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teacherRes, studentRes] = await Promise.all([
        supabase
          .from("classroom_subjects")
          .select(`
            id,
            coefficient,
            teacher:teachers(first_name, last_name),
            classroom:classrooms(name),
            subject:subjects(name)
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("enrollments")
          .select(`
            id,
            status,
            enrollment_date,
            student:students(first_name, last_name, student_number),
            classroom:classrooms(name),
            academic_year:academic_years(name)
          `)
          .order("created_at", { ascending: false }),
      ]);

      if (teacherRes.data) setTeacherAssignments(teacherRes.data as any);
      if (studentRes.data) setStudentEnrollments(studentRes.data as any);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      const table = deleteType === "teacher" ? "classroom_subjects" : "enrollments";
      const { error } = await supabase.from(table).delete().eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Suppression effectuée avec succès",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Affectations & Mouvements</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les affectations, orientations et permutations des enseignants et élèves
          </p>
        </div>
      </div>

      <Tabs defaultValue="affectations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="affectations">
            <UserCog className="h-4 w-4 mr-2" />
            Affectations
          </TabsTrigger>
          <TabsTrigger value="orientations">
            <MapPin className="h-4 w-4 mr-2" />
            Orientations
          </TabsTrigger>
          <TabsTrigger value="permutations">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Permutations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="affectations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Affectations des Enseignants</CardTitle>
                  <CardDescription>Assignez des enseignants aux classes et matières</CardDescription>
                </div>
                <AssignTeacherDialog onAssigned={fetchData}>
                  <Button>Nouvelle Affectation</Button>
                </AssignTeacherDialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : teacherAssignments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune affectation d'enseignant trouvée
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Enseignant</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Coefficient</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacherAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          {assignment.teacher.first_name} {assignment.teacher.last_name}
                        </TableCell>
                        <TableCell>{assignment.classroom.name}</TableCell>
                        <TableCell>{assignment.subject.name}</TableCell>
                        <TableCell>{assignment.coefficient}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteId(assignment.id);
                              setDeleteType("teacher");
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Inscriptions des Élèves</CardTitle>
                  <CardDescription>Inscrivez des élèves dans les classes</CardDescription>
                </div>
                <EnrollStudentDialog onEnrolled={fetchData}>
                  <Button>Nouvelle Inscription</Button>
                </EnrollStudentDialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : studentEnrollments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune inscription d'élève trouvée
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead>N° Élève</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Année</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          {enrollment.student.first_name} {enrollment.student.last_name}
                        </TableCell>
                        <TableCell>{enrollment.student.student_number}</TableCell>
                        <TableCell>{enrollment.classroom.name}</TableCell>
                        <TableCell>{enrollment.academic_year.name}</TableCell>
                        <TableCell>{formatDate(enrollment.enrollment_date)}</TableCell>
                        <TableCell>
                          <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                            {enrollment.status === "active" ? "Actif" : enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteId(enrollment.id);
                              setDeleteType("student");
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orientations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orientations des Élèves</CardTitle>
              <CardDescription>Gérez l'orientation scolaire et professionnelle des élèves</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Fonctionnalité à venir - Suivez et gérez les orientations vers différentes filières
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permutations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permutations d'Enseignants</CardTitle>
              <CardDescription>Gérez les permutations et échanges d'enseignants</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Fonctionnalité à venir - Organisez les permutations entre enseignants
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette {deleteType === "teacher" ? "affectation" : "inscription"} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Assignments;
