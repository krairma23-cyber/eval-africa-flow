import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Clock, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

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

  const getSchedulesByDay = (dayIndex: number) => {
    return schedules.filter((s) => s.day_of_week === dayIndex);
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.substring(0, 5);
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
        <p className="text-muted-foreground">Aucun emploi du temps disponible pour le moment.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Emploi du Temps - {studentName}</h3>
      </div>

      <div className="space-y-6">
        {DAYS.map((day, dayIndex) => {
          const daySchedules = getSchedulesByDay(dayIndex + 1);
          
          if (daySchedules.length === 0) return null;

          return (
            <div key={dayIndex}>
              <h4 className="font-semibold text-primary mb-3">{day}</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horaire</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Enseignant</TableHead>
                      <TableHead>Salle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daySchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {schedule.subject_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {schedule.teacher_name}
                        </TableCell>
                        <TableCell>
                          {schedule.room_number ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {schedule.room_number}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
