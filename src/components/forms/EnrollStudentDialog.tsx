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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  student_id: z.string().min(1, "Veuillez sélectionner un élève"),
  classroom_id: z.string().min(1, "Veuillez sélectionner une classe"),
  academic_year_id: z.string().min(1, "Veuillez sélectionner une année académique"),
});

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
}

interface Classroom {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  name: string;
  is_current: boolean;
}

interface EnrollStudentDialogProps {
  children: React.ReactNode;
  onEnrollmentAdded?: () => void;
  onEnrolled?: () => void;
  studentId?: string;
}

export function EnrollStudentDialog({ children, onEnrolled, onEnrollmentAdded, studentId }: EnrollStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: studentId || "",
      classroom_id: "",
      academic_year_id: "",
    },
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [studentsRes, classroomsRes, yearsRes] = await Promise.all([
        supabase.from("students").select("id, first_name, last_name, student_number").order("last_name"),
        supabase.from("classrooms").select("id, name").order("name"),
        supabase.from("academic_years").select("id, name, is_current").order("start_date", { ascending: false }),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (classroomsRes.data) setClassrooms(classroomsRes.data);
      if (yearsRes.data) {
        setAcademicYears(yearsRes.data);
        // Auto-select current academic year
        const currentYear = yearsRes.data.find(y => y.is_current);
        if (currentYear) {
          form.setValue("academic_year_id", currentYear.id);
        }
      }
      // Pre-fill student if studentId is provided
      if (studentId) {
        form.setValue("student_id", studentId);
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
      const { error } = await supabase.from("enrollments").insert({
        student_id: values.student_id,
        classroom_id: values.classroom_id,
        academic_year_id: values.academic_year_id,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'inscription a été créée avec succès",
      });

      form.reset();
      setOpen(false);
      onEnrolled?.();
      onEnrollmentAdded?.();
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
          <DialogTitle>Nouvelle Inscription d'Élève</DialogTitle>
          <DialogDescription>
            Inscrivez un élève dans une classe
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Élève</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!studentId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un élève" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} - {student.student_number}
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
              name="academic_year_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année Académique</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.is_current && "(Actuelle)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                Créer l'inscription
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
