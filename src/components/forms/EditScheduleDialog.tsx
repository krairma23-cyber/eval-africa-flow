import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

interface EditScheduleDialogProps {
  children: React.ReactNode;
  schedule: {
    id: string;
    classroom_id: string;
    subject_id: string;
    teacher_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room_number: string | null;
  };
  onScheduleUpdated: () => void;
}

const DAYS = [
  { value: 0, label: "Dimanche" },
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
];

export function EditScheduleDialog({ children, schedule, onScheduleUpdated }: EditScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    classroom_id: schedule.classroom_id,
    subject_id: schedule.subject_id,
    teacher_id: schedule.teacher_id,
    day_of_week: schedule.day_of_week.toString(),
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    room_number: schedule.room_number || "",
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [classroomsData, subjectsData, teachersData] = await Promise.all([
        supabase.from('classrooms').select('id, name').order('name'),
        supabase.from('subjects').select('id, name').order('name'),
        supabase.from('teachers').select('id, first_name, last_name').order('first_name'),
      ]);

      if (classroomsData.error) throw classroomsData.error;
      if (subjectsData.error) throw subjectsData.error;
      if (teachersData.error) throw teachersData.error;

      setClassrooms(classroomsData.data || []);
      setSubjects(subjectsData.data || []);
      setTeachers(teachersData.data || []);
    } catch (error: any) {
      await logError('Failed to fetch schedule form data', error, {
        component: 'EditScheduleDialog',
        action: 'FETCH_DATA'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          classroom_id: formData.classroom_id,
          subject_id: formData.subject_id,
          teacher_id: formData.teacher_id,
          day_of_week: parseInt(formData.day_of_week),
          start_time: formData.start_time,
          end_time: formData.end_time,
          room_number: formData.room_number || null,
        })
        .eq('id', schedule.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Créneau modifié avec succès",
      });

      setOpen(false);
      onScheduleUpdated();
    } catch (error: any) {
      await logError('Failed to update schedule', error, {
        component: 'EditScheduleDialog',
        action: 'UPDATE_SCHEDULE'
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier le créneau",
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le créneau</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Classe</Label>
            <Select
              value={formData.classroom_id}
              onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.map((classroom) => (
                  <SelectItem key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Matière</Label>
            <Select
              value={formData.subject_id}
              onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Enseignant</Label>
            <Select
              value={formData.teacher_id}
              onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un enseignant" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Jour de la semaine</Label>
            <Select
              value={formData.day_of_week}
              onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un jour" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Heure de début</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Heure de fin</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Numéro de salle (optionnel)</Label>
            <Input
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              placeholder="Ex: 101"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
