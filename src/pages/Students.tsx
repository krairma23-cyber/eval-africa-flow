import { useEffect, useState } from "react";
import { logError } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { EditStudentDialog } from "@/components/forms/EditStudentDialog";
import { EnrollStudentDialog } from "@/components/forms/EnrollStudentDialog";
import { Pencil, UserPlus, DollarSign } from "lucide-react";
import { ManagePaymentDialog } from "@/components/forms/ManagePaymentDialog";

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  avatar_url: string | null;
  created_at: string;
  tuition_fee?: number;
  amount_paid?: number;
  payment_status?: string;
  payment_due_date?: string;
  payment_notes?: string;
  enrollments: Array<{
    classroom_id: string;
    classrooms: {
      name: string;
      grade_levels: {
        name: string;
      };
    };
  }>;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          enrollments(
            classroom_id,
            classrooms(
              name,
              grade_levels(name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        await logError('Failed to fetch students', error, {
          component: 'Students',
          action: 'FETCH_STUDENTS'
        });
        toast({
          title: "Erreur",
          description: "Impossible de charger les élèves",
          variant: "destructive",
        });
      } else {
        setStudents(data || []);
      }
    } catch (error) {
      await logError('Unexpected error fetching students', error, {
        component: 'Students',
        action: 'FETCH_STUDENTS'
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

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
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
            <Users className="h-8 w-8" />
            Élèves
          </h1>
          <p className="text-muted-foreground">
            Gestion des élèves de l'établissement
          </p>
        </div>
        <AddStudentDialog onStudentAdded={fetchStudents}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un élève
          </Button>
        </AddStudentDialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un élève..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun élève trouvé</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Aucun élève ne correspond à votre recherche"
                : "Commencez par ajouter des élèves à votre établissement"}
            </p>
            {!searchTerm && (
              <AddStudentDialog onStudentAdded={fetchStudents}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le premier élève
                </Button>
              </AddStudentDialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col items-center pb-3 pt-4">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarImage src={student.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${student.first_name} ${student.last_name}`} />
                  <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                </Avatar>
                <CardTitle className="flex items-center justify-between w-full text-lg">
                  <span className="truncate">{student.first_name} {student.last_name}</span>
                  <Badge variant={student.gender === 'M' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                    {student.gender === 'M' ? 'M' : 'F'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  N° élève: {student.student_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0 pb-4">
                {student.date_of_birth && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Âge:</strong> {getAge(student.date_of_birth)} ans
                  </p>
                )}
                {student.parent_name && (
                  <p className="text-xs text-muted-foreground truncate">
                    <strong>Parent:</strong> {student.parent_name}
                  </p>
                )}
                {student.parent_phone && (
                  <p className="text-xs text-muted-foreground">
                    <strong>Téléphone:</strong> {student.parent_phone}
                  </p>
                )}
                {student.enrollments && student.enrollments.length > 0 && (
                  <div className="pt-1">
                    <Badge variant="secondary" className="text-xs">
                      {student.enrollments[0].classrooms.name} - {student.enrollments[0].classrooms.grade_levels.name}
                    </Badge>
                  </div>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  Inscrit le {formatDate(student.created_at)}
                </p>
                
                {/* Payment Status */}
                {student.tuition_fee && student.tuition_fee > 0 && (
                  <div className="pt-2 border-t mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Scolarité:</span>
                      <Badge 
                        variant={
                          student.payment_status === 'paid' ? 'default' : 
                          student.payment_status === 'partial' ? 'secondary' : 
                          'destructive'
                        }
                        className="text-xs"
                      >
                        {student.payment_status === 'paid' ? 'Payé' : 
                         student.payment_status === 'partial' ? 'Partiel' : 
                         'Non payé'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Payé: {(student.amount_paid || 0).toLocaleString('fr-FR')} / {student.tuition_fee.toLocaleString('fr-FR')} FCFA
                    </p>
                    {student.payment_status !== 'paid' && (
                      <p className="text-xs text-destructive font-medium">
                        Reste: {((student.tuition_fee || 0) - (student.amount_paid || 0)).toLocaleString('fr-FR')} FCFA
                      </p>
                    )}
                  </div>
                )}
                
                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {!student.enrollments || student.enrollments.length === 0 ? (
                      <EnrollStudentDialog studentId={student.id} onEnrollmentAdded={fetchStudents}>
                        <Button variant="default" size="sm" className="flex-1 h-8">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Inscrire
                        </Button>
                      </EnrollStudentDialog>
                    ) : (
                      <EnrollStudentDialog studentId={student.id} onEnrollmentAdded={fetchStudents}>
                        <Button variant="outline" size="sm" className="flex-1 h-8">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Changer
                        </Button>
                      </EnrollStudentDialog>
                    )}
                    <ManagePaymentDialog
                      studentId={student.id}
                      studentName={`${student.first_name} ${student.last_name}`}
                      currentTuitionFee={student.tuition_fee}
                      currentAmountPaid={student.amount_paid}
                      currentPaymentStatus={student.payment_status}
                      currentDueDate={student.payment_due_date}
                      currentNotes={student.payment_notes}
                      onPaymentUpdated={fetchStudents}
                    >
                      <Button variant="outline" size="sm" className="flex-1 h-8">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Paiement
                      </Button>
                    </ManagePaymentDialog>
                  </div>
                  <EditStudentDialog student={student} onStudentUpdated={fetchStudents}>
                    <Button variant="outline" size="sm" className="w-full h-8">
                      <Pencil className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                  </EditStudentDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}