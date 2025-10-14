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

  const groupByDay = (schedules: Schedule[]) => {
    return schedules.reduce((acc, schedule) => {
      const day = schedule.day_of_week;
      if (!acc[day]) acc[day] = [];
      acc[day].push(schedule);
      return acc;
    }, {} as Record<number, Schedule[]>);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const schedulesByDay = groupByDay(schedules);

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

      {Object.keys(schedulesByDay).length === 0 ? (
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
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((day) => {
            const daySchedules = schedulesByDay[day] || [];
            if (daySchedules.length === 0) return null;

            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="text-xl">{DAYS[day]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm font-medium min-w-[120px]">
                            <Clock className="h-4 w-4" />
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </div>
                          <div className="border-l pl-4">
                            <p className="font-medium">
                              {schedule.classroom_subjects.subjects.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.classroom_subjects.classrooms.name} • {" "}
                              {schedule.classroom_subjects.teachers.first_name}{" "}
                              {schedule.classroom_subjects.teachers.last_name}
                            </p>
                          </div>
                        </div>
                        {schedule.room_number && (
                          <div className="text-sm text-muted-foreground">
                            Salle {schedule.room_number}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
