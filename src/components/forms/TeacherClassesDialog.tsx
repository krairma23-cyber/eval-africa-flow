import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Users, Calendar, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EditAssignmentDialog } from "./EditAssignmentDialog";

interface TeacherClass {
  id: string;
  classroom_id: string;
  subject_id: string;
  coefficient: number;
  classrooms: {
    id: string;
    name: string;
  };
  subjects: {
    name: string;
    code: string;
  };
}

interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
}

interface TeacherClassesDialogProps {
  teacherId: string;
  teacherName: string;
  children: React.ReactNode;
}

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function TeacherClassesDialog({ teacherId, teacherName, children }: TeacherClassesDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherClass | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      fetchTeacherClasses();
    }
  }, [open, teacherId]);

  const fetchTeacherClasses = async () => {
    setLoading(true);
    try {
      // Fetch assigned classes
      const { data: classData, error: classError } = await supabase
        .from('classroom_subjects')
        .select(`
          id,
          classroom_id,
          subject_id,
          coefficient,
          classrooms (id, name),
          subjects (name, code)
        `)
        .eq('teacher_id', teacherId);

      if (classError) throw classError;

      setClasses(classData || []);

      // Fetch schedules for these classes
      if (classData && classData.length > 0) {
        const classroomIds = classData.map(c => c.classroom_id);
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedules')
          .select('classroom_id, day_of_week, start_time, end_time, room_number')
          .eq('teacher_id', teacherId)
          .in('classroom_id', classroomIds);

        if (scheduleError) throw scheduleError;

        // Group schedules by classroom_id
        const scheduleMap: Record<string, Schedule[]> = {};
        scheduleData?.forEach(schedule => {
          if (!scheduleMap[schedule.classroom_id]) {
            scheduleMap[schedule.classroom_id] = [];
          }
          scheduleMap[schedule.classroom_id].push(schedule);
        });
        setSchedules(scheduleMap);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les classes de l'enseignant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const navigateToClassroom = (classroomId: string) => {
    setOpen(false);
    navigate(`/dashboard/classrooms?highlight=${classroomId}`);
  };

  const handleEditClick = (classItem: TeacherClass) => {
    setSelectedAssignment(classItem);
    setEditDialogOpen(true);
  };

  const handleAssignmentUpdated = () => {
    fetchTeacherClasses();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Classes de {teacherName}</DialogTitle>
          <DialogDescription>
            Classes et matières assignées avec l'emploi du temps
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune classe assignée à cet enseignant</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => {
              const classSchedules = schedules[classItem.classroom_id] || [];
              return (
                <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>{classItem.classrooms.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {classItem.subjects.name} ({classItem.subjects.code})
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Coefficient: {classItem.coefficient}</span>
                    </div>
                    
                    {classSchedules.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                          <Calendar className="h-4 w-4" />
                          <span>Emploi du temps:</span>
                        </div>
                        <div className="space-y-1.5">
                          {classSchedules.map((schedule, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2">
                              <span className="font-medium">{DAYS[schedule.day_of_week]}</span>
                              <span className="text-muted-foreground">
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                {schedule.room_number && ` • Salle ${schedule.room_number}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigateToClassroom(classItem.classroom_id)}
                      >
                        Voir la classe
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="px-3"
                        onClick={() => handleEditClick(classItem)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>

      {selectedAssignment && (
        <EditAssignmentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          assignmentId={selectedAssignment.id}
          currentSubjectId={selectedAssignment.subject_id}
          currentCoefficient={selectedAssignment.coefficient}
          teacherId={teacherId}
          classroomId={selectedAssignment.classroom_id}
          onUpdated={handleAssignmentUpdated}
        />
      )}
    </Dialog>
  );
}