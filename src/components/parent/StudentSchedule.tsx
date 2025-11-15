import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Calendar } from "lucide-react";

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_name: string;
  teacher_name: string;
  room_number: string | null;
}

interface StudentScheduleProps {
  classroomId: string;
  studentName: string;
}

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function StudentSchedule({ classroomId, studentName }: StudentScheduleProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, [classroomId]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room_number,
          subjects (name),
          teachers (first_name, last_name)
        `)
        .eq("classroom_id", classroomId)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;

      const formattedSchedules = data?.map((schedule: any) => ({
        id: schedule.id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        subject_name: schedule.subjects?.name || "N/A",
        teacher_name: schedule.teachers
          ? `${schedule.teachers.first_name} ${schedule.teachers.last_name}`
          : "N/A",
        room_number: schedule.room_number,
      })) || [];

      setSchedules(formattedSchedules);
    } catch (error) {
      console.error("Erreur lors du chargement de l'emploi du temps:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
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

  // Get schedule for a specific day and time
  const getScheduleForDayAndTime = (day: number, time: string) => {
    return schedules.find(s => s.day_of_week === day && s.start_time === time);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Chargement de l'emploi du temps...</p>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Emploi du Temps - {studentName}</h3>
        </div>
        <p className="text-muted-foreground">Aucun emploi du temps disponible pour le moment.</p>
      </Card>
    );
  }

  const timeSlots = getTimeSlots();

  return (
    <Card className="overflow-hidden">
      <div className="p-6 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Emploi du Temps - {studentName}</h3>
        </div>
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-2 text-left font-semibold text-sm w-24 sticky left-0 bg-muted/50 z-10">
                  Horaire
                </th>
                {[1, 2, 3, 4, 5].map((day) => (
                  <th key={day} className="border p-2 text-center font-semibold text-sm">
                    {DAYS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot) => (
                <tr key={timeSlot} className="hover:bg-accent/30 transition-colors">
                  <td className="border p-2 font-medium sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{formatTime(timeSlot)}</span>
                    </div>
                  </td>
                  {[1, 2, 3, 4, 5].map((day) => {
                    const schedule = getScheduleForDayAndTime(day, timeSlot);
                    return (
                      <td key={day} className="border p-2 align-top">
                        {schedule ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-sm text-primary">
                              {schedule.subject_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {schedule.teacher_name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </div>
                            {schedule.room_number && (
                              <div className="text-xs font-medium text-foreground">
                                Salle {schedule.room_number}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground text-center">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
