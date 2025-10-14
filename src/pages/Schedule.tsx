import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Clock } from "lucide-react";
import { AddScheduleDialog } from "@/components/forms/AddScheduleDialog";

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_number: string | null;
  classroom_subjects: {
    id: string;
    classroom_id: string;
    subject_id: string;
    teacher_id: string;
    classrooms: {
      name: string;
    };
    subjects: {
      name: string;
    };
    teachers: {
      first_name: string;
      last_name: string;
    };
  };
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

export default function Schedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          classroom_subjects (
            id,
            classroom_id,
            subject_id,
            teacher_id,
            classrooms (name),
            subjects (name),
            teachers (first_name, last_name)
          )
        `)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const timeSlots = getTimeSlots();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Emploi du Temps
          </h1>
          <p className="text-muted-foreground">
            Gestion des horaires de cours
          </p>
        </div>
        <AddScheduleDialog onScheduleAdded={fetchSchedules}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un créneau
          </Button>
        </AddScheduleDialog>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun créneau défini</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par créer des créneaux pour votre emploi du temps
            </p>
            <AddScheduleDialog onScheduleAdded={fetchSchedules}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier créneau
              </Button>
            </AddScheduleDialog>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-3 text-left font-semibold min-w-[100px] sticky left-0 bg-muted/50 z-10">
                    Horaire
                  </th>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <th key={day} className="border p-3 text-center font-semibold min-w-[200px]">
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
                                {schedule.classroom_subjects.subjects.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {schedule.classroom_subjects.classrooms.name}
                              </div>
                              <div className="text-sm">
                                {schedule.classroom_subjects.teachers.first_name}{" "}
                                {schedule.classroom_subjects.teachers.last_name}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
