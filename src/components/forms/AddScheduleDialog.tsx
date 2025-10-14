import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  classroom_subject_id: z.string().min(1, "Veuillez sélectionner une affectation"),
  day_of_week: z.string().min(1, "Veuillez sélectionner un jour"),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
  room_number: z.string().optional(),
});

interface ClassroomSubject {
  id: string;
  classrooms: { name: string };
  subjects: { name: string };
  teachers: { first_name: string; last_name: string };
}

interface AddScheduleDialogProps {
  children: React.ReactNode;
  onScheduleAdded: () => void;
}

const DAYS = [
  { value: "1", label: "Lundi" },
  { value: "2", label: "Mardi" },
  { value: "3", label: "Mercredi" },
  { value: "4", label: "Jeudi" },
  { value: "5", label: "Vendredi" },
];

export function AddScheduleDialog({ children, onScheduleAdded }: AddScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classroomSubjects, setClassroomSubjects] = useState<ClassroomSubject[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classroom_subject_id: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      room_number: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchClassroomSubjects();
    }
  }, [open]);

  const fetchClassroomSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("classroom_subjects")
        .select(`
          id,
          classrooms (name),
          subjects (name),
          teachers (first_name, last_name)
        `)
        .order('id');

      if (error) throw error;
      setClassroomSubjects(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les affectations",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("schedules").insert({
        classroom_subject_id: values.classroom_subject_id,
        day_of_week: parseInt(values.day_of_week),
        start_time: values.start_time,
        end_time: values.end_time,
        room_number: values.room_number || null,
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le créneau a été ajouté avec succès",
      });

      form.reset();
      setOpen(false);
      onScheduleAdded();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau Créneau</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau créneau à l'emploi du temps
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="classroom_subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe / Matière / Enseignant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une affectation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[100]">
                      {classroomSubjects.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Aucune affectation disponible
                        </div>
                      ) : (
                        classroomSubjects.map((cs) => (
                          <SelectItem key={cs.id} value={cs.id}>
                            {cs.classrooms.name} - {cs.subjects.name} ({cs.teachers.first_name} {cs.teachers.last_name})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jour</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un jour" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[100]">
                      {DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="room_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de salle (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: A101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
