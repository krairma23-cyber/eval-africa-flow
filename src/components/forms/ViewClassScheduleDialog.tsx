import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar } from "lucide-react";

interface Schedule {
  id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
  subjects: {
    name: string;
  };
  teachers: {
    first_name: string;
    last_name: string;
  };
}

interface ViewClassScheduleDialogProps {
  children: React.ReactNode;
  classroomId: string;
  classroomName: string;
}

const DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi"
];

export function ViewClassScheduleDialog({ 
  children, 
  classroomId,
  classroomName 
}: ViewClassScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSchedules();
    }
  }, [open, classroomId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          subjects (name),
          teachers (first_name, last_name)
        `)
        .eq('classroom_id', classroomId)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'emploi du temps",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  // Generate unique time slots
  const getTimeSlots = () => {
    const slots = new Set<string>();
    schedules.forEach(schedule => {
      slots.add(schedule.start_time);
    });
    return Array.from(slots).sort();
  };

  // Group schedules by day and time
  const getScheduleForDayAndTime = (day: number, time: string) => {
    return schedules.find(s => s.day_of_week === day && s.start_time === time);
  };

  const timeSlots = getTimeSlots();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Emploi du temps - {classroomName}
          </DialogTitle>
          <DialogDescription>
            Horaires des cours pour cette classe
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
          </div>
        ) : schedules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun créneau défini</h3>
              <p className="text-muted-foreground text-center">
                Cette classe n'a pas encore d'emploi du temps
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-3 text-left font-semibold min-w-[100px] sticky left-0 bg-muted/50 z-10">
                    Horaire
                  </th>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <th key={day} className="border p-3 text-center font-semibold min-w-[180px]">
                      {DAYS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-accent/30 transition-colors">
                    <td className="border p-3 font-medium text-sm sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(timeSlot)}
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const schedule = getScheduleForDayAndTime(day, timeSlot);
                      return (
                        <td key={day} className="border p-3">
                          {schedule ? (
                            <div className="space-y-1">
                              <div className="font-semibold text-primary">
                                {schedule.subjects.name}
                              </div>
                              <div className="text-sm">
                                {schedule.teachers.first_name}{" "}
                                {schedule.teachers.last_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                {schedule.room_number && ` • Salle ${schedule.room_number}`}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-sm">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
