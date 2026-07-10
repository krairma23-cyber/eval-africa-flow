import { useEffect, useState } from "react";
import { logError } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Users, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { EditStudentDialog } from "@/components/forms/EditStudentDialog";
import { EnrollStudentDialog } from "@/components/forms/EnrollStudentDialog";
import { Pencil, UserPlus, DollarSign, Check, X, Mail, Trash2 } from "lucide-react";
import { DeleteConfirmButton } from "@/components/shared/DeleteConfirmButton";
import { SendParentPortalLinkDialog } from "@/components/forms/SendParentPortalLinkDialog";
import { ManagePaymentDialog } from "@/components/forms/ManagePaymentDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { PageHeroBanner } from "@/components/layout/PageHeroBanner";
import studentsDecor from "@/assets/decor-students.jpg";

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
  payment_method?: string;
  payment_due_date?: string;
  payment_notes?: string;
  enrollments: Array<{
    classroom_id: string;
    classrooms: {
      name: string;
      color: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");
  const { toast } = useToast();
  const { t } = useLanguage();

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
              color,
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

  // Helper: get first valid enrollment (with non-null classroom)
  const getEnrollment = (s: Student) =>
    s.enrollments?.find((e) => e?.classrooms) ?? null;

  // Get unique classrooms and grade levels for filters
  const uniqueClassrooms = Array.from(
    new Set(
      students
        .map((s) => getEnrollment(s)?.classrooms?.name)
        .filter((n): n is string => !!n)
    )
  ).sort();

  const uniqueGradeLevels = Array.from(
    new Set(
      students
        .map((s) => getEnrollment(s)?.classrooms?.grade_levels?.name)
        .filter((n): n is string => !!n)
    )
  ).sort();

  const filteredStudents = students
    .filter((student) => {
      const enr = getEnrollment(student);
      const classroom = enr?.classrooms;

      const matchesSearch =
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_number.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClassroom =
        selectedClassroom === "all" || classroom?.name === selectedClassroom;

      const matchesGradeLevel =
        selectedGradeLevel === "all" ||
        classroom?.grade_levels?.name === selectedGradeLevel;

      const matchesPaymentStatus =
        selectedPaymentStatus === "all" ||
        student.payment_status === selectedPaymentStatus;

      return matchesSearch && matchesClassroom && matchesGradeLevel && matchesPaymentStatus;
    })
    .sort((a, b) => {
      const ea = getEnrollment(a);
      const eb = getEnrollment(b);
      if (!ea) return 1;
      if (!eb) return -1;
      return (ea.classrooms?.name ?? "").localeCompare(eb.classrooms?.name ?? "");
    });

  // Pagination calculations
  const totalStudents = filteredStudents.length;
  const totalPages = Math.ceil(totalStudents / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClassroom, selectedGradeLevel, selectedPaymentStatus]);

  // Group students by classroom
  const studentsByClassroom = paginatedStudents.reduce((acc, student) => {
    const enr = getEnrollment(student);
    const classroom = enr?.classrooms;
    if (classroom?.name) {
      const classroomName = classroom.name;
      if (!acc[classroomName]) {
        acc[classroomName] = {
          color: classroom.color ?? "#888",
          gradeLevel: classroom.grade_levels?.name ?? "",
          students: []
        };
      }
      acc[classroomName].students.push(student);
    } else {
      if (!acc['Sans classe']) {
        acc['Sans classe'] = {
          color: '#888',
          gradeLevel: '',
          students: []
        };
      }
      acc['Sans classe'].students.push(student);
    }
    return acc;
  }, {} as Record<string, { color: string; gradeLevel: string; students: Student[] }>);

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

  // Unique visual identity per student, derived deterministically from their id.
  const STUDENT_THEMES = [
    { from: "#6366f1", to: "#a855f7", ring: "#6366f1", pattern: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.35) 0, transparent 40%)" },
    { from: "#0ea5e9", to: "#22d3ee", ring: "#0ea5e9", pattern: "repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 8px, transparent 8px 16px)" },
    { from: "#10b981", to: "#84cc16", ring: "#10b981", pattern: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0, transparent 50%)" },
    { from: "#f59e0b", to: "#ef4444", ring: "#f59e0b", pattern: "repeating-linear-gradient(-45deg, rgba(255,255,255,0.12) 0 6px, transparent 6px 14px)" },
    { from: "#ec4899", to: "#f43f5e", ring: "#ec4899", pattern: "radial-gradient(circle at 50% 100%, rgba(255,255,255,0.35) 0, transparent 60%)" },
    { from: "#8b5cf6", to: "#3b82f6", ring: "#8b5cf6", pattern: "linear-gradient(120deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(255,255,255,0.15) 100%)" },
    { from: "#14b8a6", to: "#0284c7", ring: "#14b8a6", pattern: "repeating-radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0 3px, transparent 3px 12px)" },
    { from: "#f97316", to: "#eab308", ring: "#f97316", pattern: "linear-gradient(60deg, rgba(255,255,255,0.2) 0%, transparent 50%)" },
    { from: "#06b6d4", to: "#6366f1", ring: "#06b6d4", pattern: "radial-gradient(ellipse at 0% 50%, rgba(255,255,255,0.3) 0, transparent 50%)" },
    { from: "#a855f7", to: "#ec4899", ring: "#a855f7", pattern: "repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0 10px, transparent 10px 20px)" },
    { from: "#22c55e", to: "#14b8a6", ring: "#22c55e", pattern: "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.25) 0, transparent 45%)" },
    { from: "#ef4444", to: "#f97316", ring: "#ef4444", pattern: "linear-gradient(200deg, rgba(255,255,255,0.2) 0%, transparent 60%)" },
  ];

  const getStudentTheme = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return STUDENT_THEMES[hash % STUDENT_THEMES.length];
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
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <PageHeroBanner
        image={studentsDecor}
        alt="Illustration élèves et livres"
        icon={<Users className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />}
        title={t('students.title')}
        subtitle={t('students.subtitle')}
        action={
          <AddStudentDialog onStudentAdded={fetchStudents}>
            <Button className="w-full sm:w-auto text-sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('students.add')}
            </Button>
          </AddStudentDialog>
        }
      />


      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder={t('students.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
          />
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Filter className="h-4 w-4 flex-shrink-0" />
              {t('students.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="min-w-0">
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Classe</label>
                <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                  <SelectTrigger className="text-sm">
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

              <div className="min-w-0">
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Niveau</label>
                <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    {uniqueGradeLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0">
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Statut paiement</label>
                <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="partial">Partiel</SelectItem>
                    <SelectItem value="pending">Non payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-0">
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Par page</label>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>
                {totalStudents} élève{totalStudents > 1 ? 's' : ''}
              </span>
              <span>
                Page {currentPage}/{totalPages}
              </span>
            </div>
          </CardContent>
        </Card>
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
        <div className="space-y-6">
          {Object.entries(studentsByClassroom).map(([classroomName, classroomData]) => (
            <div key={classroomName}>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: classroomData.color }}
                />
                <h2 className="text-base sm:text-xl font-semibold text-foreground">
                  {classroomName}
                  {classroomData.gradeLevel && ` - ${classroomData.gradeLevel}`}
                </h2>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {classroomData.students.length} élève{classroomData.students.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {classroomData.students.map((student) => {
            const theme = getStudentTheme(student.id);
            return (
            <Card
              key={student.id}
              className="hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden relative border-t-4"
              style={{ borderTopColor: theme.ring }}
            >
              <div
                className="h-16 sm:h-20 w-full relative"
                style={{
                  backgroundImage: `${theme.pattern}, linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                }}
              />
              <CardHeader className="flex flex-col items-center pb-2 sm:pb-3 pt-0 px-3 sm:px-6 -mt-8 sm:-mt-10">
                <Avatar
                  className="h-14 w-14 sm:h-20 sm:w-20 mb-2 sm:mb-3 ring-4 ring-background shadow-md"
                  style={{ boxShadow: `0 0 0 3px ${theme.ring}` }}
                >
                  <AvatarImage src={student.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${student.first_name} ${student.last_name}`} />
                  <AvatarFallback
                    className="text-sm sm:text-lg font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                  >
                    {student.first_name[0]}{student.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="flex items-center justify-between w-full text-base sm:text-lg min-w-0">
                  <span className="truncate">{student.first_name} {student.last_name}</span>
                  <Badge variant={student.gender === 'M' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0 text-xs">
                    {student.gender === 'M' ? 'M' : 'F'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs truncate w-full text-center">
                  N° {student.student_number}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0 pb-3 sm:pb-4 px-3 sm:px-6">
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
                {(() => {
                  const enr = getEnrollment(student);
                  const c = enr?.classrooms;
                  if (!c) return null;
                  return (
                    <div className="pt-1 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.color ?? "#888" }}
                      />
                      <Badge variant="secondary" className="text-xs">
                        {c.name}{c.grade_levels?.name ? ` - ${c.grade_levels.name}` : ""}
                      </Badge>
                    </div>
                  );
                })()}
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
                
                <div className="pt-2 flex flex-col gap-1.5 sm:gap-2">
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {!student.enrollments || student.enrollments.length === 0 ? (
                      <EnrollStudentDialog studentId={student.id} onEnrollmentAdded={fetchStudents}>
                        <Button variant="default" size="sm" className="w-full h-7 sm:h-8 text-xs px-2">
                          <UserPlus className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Inscrire</span>
                        </Button>
                      </EnrollStudentDialog>
                    ) : (
                      <EnrollStudentDialog studentId={student.id} onEnrollmentAdded={fetchStudents}>
                        <Button variant="outline" size="sm" className="w-full h-7 sm:h-8 text-xs px-2">
                          <UserPlus className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Changer</span>
                        </Button>
                      </EnrollStudentDialog>
                    )}
                    <ManagePaymentDialog
                      studentId={student.id}
                      studentName={`${student.first_name} ${student.last_name}`}
                      currentTuitionFee={student.tuition_fee}
                      currentAmountPaid={student.amount_paid}
                      currentPaymentStatus={student.payment_status}
                      currentPaymentMethod={student.payment_method}
                      currentDueDate={student.payment_due_date}
                      currentNotes={student.payment_notes}
                      onPaymentUpdated={fetchStudents}
                    >
                      <Button variant="outline" size="sm" className="w-full h-7 sm:h-8 text-xs px-2">
                        <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Paiement</span>
                      </Button>
                    </ManagePaymentDialog>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full h-7 sm:h-8 text-xs px-2"
                      onClick={async () => {
                        try {
                          const { data: userData } = await supabase.auth.getUser();
                          const classroomId = student.enrollments && student.enrollments.length > 0
                            ? student.enrollments[0].classroom_id
                            : null;

                          if (!classroomId) {
                            toast({
                              title: "Erreur",
                              description: "L'élève doit être inscrit dans une classe",
                              variant: "destructive",
                            });
                            return;
                          }

                          const { error } = await supabase
                            .from("student_attendance")
                            .upsert({
                              student_id: student.id,
                              classroom_id: classroomId,
                              date: new Date().toISOString().split('T')[0],
                              status: 'present',
                              marked_by: userData.user?.id
                            }, {
                              onConflict: 'student_id,date'
                            });

                          if (error) throw error;

                          toast({
                            title: "Présence marquée",
                            description: `${student.first_name} ${student.last_name} est présent(e)`,
                          });
                        } catch (error) {
                          toast({
                            title: "Erreur",
                            description: "Impossible d'enregistrer la présence",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Check className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Présent</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full h-7 sm:h-8 text-xs px-2"
                      onClick={async () => {
                        try {
                          const { data: userData } = await supabase.auth.getUser();
                          const classroomId = student.enrollments && student.enrollments.length > 0
                            ? student.enrollments[0].classroom_id
                            : null;

                          if (!classroomId) {
                            toast({
                              title: "Erreur",
                              description: "L'élève doit être inscrit dans une classe",
                              variant: "destructive",
                            });
                            return;
                          }

                          const { error } = await supabase
                            .from("student_attendance")
                            .upsert({
                              student_id: student.id,
                              classroom_id: classroomId,
                              date: new Date().toISOString().split('T')[0],
                              status: 'absent',
                              marked_by: userData.user?.id
                            }, {
                              onConflict: 'student_id,date'
                            });

                          if (error) throw error;

                          toast({
                            title: "Absence marquée",
                            description: `${student.first_name} ${student.last_name} est absent(e)`,
                            variant: "destructive",
                          });
                        } catch (error) {
                          toast({
                            title: "Erreur",
                            description: "Impossible d'enregistrer l'absence",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <X className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Absent</span>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <EditStudentDialog student={student} onStudentUpdated={fetchStudents}>
                      <Button variant="outline" size="sm" className="w-full h-7 sm:h-8 text-xs px-2">
                        <Pencil className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">Modifier</span>
                      </Button>
                    </EditStudentDialog>
                    {student.parent_email ? (
                      <SendParentPortalLinkDialog
                        studentName={`${student.first_name} ${student.last_name}`}
                        parentEmail={student.parent_email}
                        parentName={student.parent_name}
                      >
                        <Button variant="secondary" size="sm" className="w-full h-7 sm:h-8 text-xs px-2">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">Portail</span>
                        </Button>
                      </SendParentPortalLinkDialog>
                    ) : (
                      <div></div>
                    )}
                  </div>
                  <DeleteConfirmButton
                    table="students"
                    id={student.id}
                    itemLabel={`l'élève ${student.first_name} ${student.last_name}`}
                    description={`Supprimer ${student.first_name} ${student.last_name} ? L'inscription, les notes, les présences et paiements liés seront également supprimés.`}
                    onDeleted={fetchStudents}
                    variant="outline"
                    size="sm"
                    className="w-full h-7 sm:h-8 text-xs px-2 text-destructive hover:text-destructive border-destructive/40"
                  >
                    <Trash2 className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">Supprimer</span>
                  </DeleteConfirmButton>
                </div>
              </CardContent>
            </Card>
                );})}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && filteredStudents.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}