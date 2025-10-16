import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logError } from "@/lib/logger";

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  gender: string;
  parent_name: string;
  parent_phone: string;
}

interface ViewClassStudentsDialogProps {
  classroomId: string;
  classroomName: string;
  children: React.ReactNode;
}

export function ViewClassStudentsDialog({ classroomId, classroomName, children }: ViewClassStudentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classroomColor, setClassroomColor] = useState<string>('#3b82f6');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch classroom color
      const { data: classroomData, error: classroomError } = await supabase
        .from("classrooms")
        .select("color")
        .eq("id", classroomId)
        .single();

      if (classroomError) throw classroomError;
      if (classroomData?.color) setClassroomColor(classroomData.color);

      // Fetch students
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          students (
            id,
            student_number,
            first_name,
            last_name,
            gender,
            parent_name,
            parent_phone
          )
        `)
        .eq("classroom_id", classroomId)
        .eq("status", "active");

      if (error) throw error;

      const studentsData = data?.map((enrollment: any) => enrollment.students).filter(Boolean) || [];
      setStudents(studentsData);
    } catch (error) {
      await logError('Failed to fetch classroom students', error, {
        component: 'ViewClassStudentsDialog',
        action: 'FETCH_STUDENTS'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les élèves",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Élèves de {classroomName}
          </DialogTitle>
          <DialogDescription>
            Liste des élèves inscrits dans cette classe
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun élève inscrit</h3>
            <p className="text-muted-foreground">
              Cette classe ne contient aucun élève pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                style={{ borderLeftColor: classroomColor, borderLeftWidth: '4px' }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: classroomColor }}
                      />
                      <h4 className="font-semibold">
                        {student.first_name} {student.last_name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {student.student_number}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2">
                      <div>
                        <span className="font-medium">Genre:</span> {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                      </div>
                      <div>
                        <span className="font-medium">Parent:</span> {student.parent_name || 'N/A'}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Téléphone:</span> {student.parent_phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{students.length}</span> élève{students.length > 1 ? 's' : ''}
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
