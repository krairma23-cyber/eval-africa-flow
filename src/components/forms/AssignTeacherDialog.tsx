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
  teacher_id: z.string().min(1, "Veuillez sélectionner un enseignant"),
  classroom_id: z.string().min(1, "Veuillez sélectionner une classe"),
  subject_id: z.string().min(1, "Veuillez sélectionner une matière"),
  coefficient: z.string().min(1, "Le coefficient est requis"),
});

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
}

interface Classroom {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface AssignTeacherDialogProps {
  children: React.ReactNode;
  onAssigned: () => void;
  teacherId?: string;
}

export function AssignTeacherDialog({ children, onAssigned, teacherId }: AssignTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacher_id: teacherId || "",
      classroom_id: "",
      subject_id: "",
      coefficient: "1",
    },
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [teachersRes, classroomsRes, subjectsRes] = await Promise.all([
        supabase.from("teachers").select("id, first_name, last_name, specialization").order("last_name"),
        supabase.from("classrooms").select("id, name").order("name"),
        supabase.from("subjects").select("id, name").order("name"),
      ]);

      if (teachersRes.data) setTeachers(teachersRes.data);
      if (classroomsRes.data) setClassrooms(classroomsRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      
      // Pre-fill teacher if teacherId is provided
      if (teacherId) {
        form.setValue("teacher_id", teacherId);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("classroom_subjects").insert({
        teacher_id: values.teacher_id,
        classroom_id: values.classroom_id,
        subject_id: values.subject_id,
        coefficient: parseFloat(values.coefficient),
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'affectation a été créée avec succès",
      });

      form.reset();
      setOpen(false);
      onAssigned();
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
          <DialogTitle>Nouvelle Affectation d'Enseignant</DialogTitle>
          <DialogDescription>
            Assignez un enseignant à une classe et une matière
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enseignant</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!teacherId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un enseignant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.first_name} {teacher.last_name}
                          {teacher.specialization && ` - ${teacher.specialization}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classroom_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matière</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coefficient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coefficient</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
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
                Créer l'affectation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
