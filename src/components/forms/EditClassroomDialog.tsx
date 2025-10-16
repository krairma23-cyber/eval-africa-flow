import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  campus_id: z.string().min(1, "Le campus est requis"),
  grade_level_id: z.string().min(1, "Le niveau est requis"),
  academic_year_id: z.string().min(1, "L'année académique est requise"),
  capacity: z.coerce.number().min(1, "La capacité doit être au moins 1"),
  color: z.string().min(1, "La couleur est requise"),
});

const predefinedColors = [
  { name: "Bleu", value: "#3b82f6" },
  { name: "Rouge", value: "#ef4444" },
  { name: "Vert", value: "#10b981" },
  { name: "Jaune", value: "#f59e0b" },
  { name: "Orange", value: "#f97316" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#ec4899" },
  { name: "Noir", value: "#000000" },
];

interface Campus {
  id: string;
  name: string;
}

interface GradeLevel {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface EditClassroomDialogProps {
  classroom: {
    id: string;
    name: string;
    campus_id: string;
    grade_level_id: string;
    academic_year_id: string;
    capacity: number;
    color?: string;
  };
  onClassroomUpdated: () => void;
  children: React.ReactNode;
}

export function EditClassroomDialog({
  classroom,
  onClassroomUpdated,
  children,
}: EditClassroomDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: classroom.name,
      campus_id: classroom.campus_id,
      grade_level_id: classroom.grade_level_id,
      academic_year_id: classroom.academic_year_id,
      capacity: classroom.capacity,
      color: classroom.color || "#3b82f6",
    },
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [campusesRes, gradeLevelsRes, academicYearsRes] = await Promise.all([
        supabase.from("campuses").select("id, name").order("name"),
        supabase.from("grade_levels").select("id, name").order("level_order"),
        supabase.from("academic_years").select("id, name").order("name"),
      ]);

      if (campusesRes.error) throw campusesRes.error;
      if (gradeLevelsRes.error) throw gradeLevelsRes.error;
      if (academicYearsRes.error) throw academicYearsRes.error;

      setCampuses(campusesRes.data || []);
      setGradeLevels(gradeLevelsRes.data || []);
      setAcademicYears(academicYearsRes.data || []);
    } catch (error) {
      await logError("Failed to fetch classroom data", error, {
        component: "EditClassroomDialog",
        action: "FETCH_DATA",
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("classrooms")
        .update({
          name: values.name,
          campus_id: values.campus_id,
          grade_level_id: values.grade_level_id,
          academic_year_id: values.academic_year_id,
          capacity: values.capacity,
          color: values.color,
        })
        .eq("id", classroom.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Classe modifiée avec succès",
      });

      setOpen(false);
      onClassroomUpdated();
    } catch (error) {
      await logError("Failed to update classroom", error, {
        component: "EditClassroomDialog",
        action: "UPDATE_CLASSROOM",
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier la classe",
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
          <DialogTitle>Modifier la classe</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la classe
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la classe</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 6ème A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campus_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un campus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {campus.name}
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
              name="grade_level_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradeLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
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
                  <FormLabel>Année académique</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'année" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
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
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacité</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur de la classe</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.onChange(color.value)}
                          className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                          style={{ 
                            backgroundColor: color.value,
                            borderColor: field.value === color.value ? "#000" : "transparent"
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Modification..." : "Modifier"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
