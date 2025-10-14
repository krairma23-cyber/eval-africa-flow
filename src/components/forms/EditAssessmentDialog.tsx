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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";

const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  assessment_type_id: z.string().min(1, "Le type est requis"),
  classroom_subject_id: z.string().min(1, "La matière/classe est requise"),
  term_id: z.string().min(1, "Le trimestre est requis"),
  assessment_date: z.string().min(1, "La date est requise"),
  max_score: z.coerce.number().min(1, "La note maximale doit être au moins 1"),
  coefficient: z.coerce.number().min(0.1, "Le coefficient doit être au moins 0.1"),
});

interface AssessmentType {
  id: string;
  name: string;
}

interface ClassroomSubject {
  id: string;
  subjects: { name: string };
  classrooms: { name: string };
}

interface Term {
  id: string;
  name: string;
}

interface EditAssessmentDialogProps {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    assessment_type_id: string;
    classroom_subject_id: string;
    term_id: string;
    assessment_date: string;
    max_score: number;
    coefficient: number;
  };
  onAssessmentUpdated: () => void;
  children: React.ReactNode;
}

export function EditAssessmentDialog({
  assessment,
  onAssessmentUpdated,
  children,
}: EditAssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [classroomSubjects, setClassroomSubjects] = useState<ClassroomSubject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: assessment.title,
      description: assessment.description || "",
      assessment_type_id: assessment.assessment_type_id,
      classroom_subject_id: assessment.classroom_subject_id,
      term_id: assessment.term_id,
      assessment_date: assessment.assessment_date,
      max_score: assessment.max_score,
      coefficient: assessment.coefficient,
    },
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [typesRes, subjectsRes, termsRes] = await Promise.all([
        supabase.from("assessment_types").select("id, name").order("name"),
        supabase
          .from("classroom_subjects")
          .select("id, subjects(name), classrooms(name)")
          .order("id"),
        supabase.from("terms").select("id, name").order("term_number"),
      ]);

      if (typesRes.error) throw typesRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (termsRes.error) throw termsRes.error;

      setAssessmentTypes(typesRes.data || []);
      setClassroomSubjects(subjectsRes.data || []);
      setTerms(termsRes.data || []);
    } catch (error) {
      await logError("Failed to fetch assessment data", error, {
        component: "EditAssessmentDialog",
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
        .from("assessments")
        .update({
          title: values.title,
          description: values.description || null,
          assessment_type_id: values.assessment_type_id,
          classroom_subject_id: values.classroom_subject_id,
          term_id: values.term_id,
          assessment_date: values.assessment_date,
          max_score: values.max_score,
          coefficient: values.coefficient,
        })
        .eq("id", assessment.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Évaluation modifiée avec succès",
      });

      setOpen(false);
      onAssessmentUpdated();
    } catch (error) {
      await logError("Failed to update assessment", error, {
        component: "EditAssessmentDialog",
        action: "UPDATE_ASSESSMENT",
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'évaluation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'évaluation</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'évaluation
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Contrôle de mathématiques" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description de l'évaluation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessment_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type d'évaluation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assessmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
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
              name="classroom_subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matière / Classe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classroomSubjects.map((cs) => (
                        <SelectItem key={cs.id} value={cs.id}>
                          {cs.subjects.name} - {cs.classrooms.name}
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
              name="term_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trimestre</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
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
              name="assessment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de l'évaluation</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note maximale</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="20" {...field} />
                    </FormControl>
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
                      <Input type="number" step="0.1" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
