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
  subject_id: z.string().min(1, "Veuillez sélectionner une matière"),
  coefficient: z.string().min(1, "Le coefficient est requis"),
});

interface Subject {
  id: string;
  name: string;
}

interface EditAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  currentSubjectId: string;
  currentCoefficient: number;
  teacherId: string;
  classroomId: string;
  onUpdated: () => void;
}

export function EditAssignmentDialog({ 
  open, 
  onOpenChange, 
  assignmentId,
  currentSubjectId,
  currentCoefficient,
  teacherId,
  classroomId,
  onUpdated 
}: EditAssignmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject_id: currentSubjectId,
      coefficient: currentCoefficient.toString(),
    },
  });

  useEffect(() => {
    if (open) {
      fetchSubjects();
      form.reset({
        subject_id: currentSubjectId,
        coefficient: currentCoefficient.toString(),
      });
    }
  }, [open, currentSubjectId, currentCoefficient]);

  const fetchSubjects = async () => {
    try {
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("id, name")
        .order("name");

      if (subjectsData) {
        setSubjects(subjectsData);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les matières",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("classroom_subjects")
        .update({
          subject_id: values.subject_id,
          coefficient: parseFloat(values.coefficient),
        })
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'affectation a été modifiée avec succès",
      });

      onOpenChange(false);
      onUpdated();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier l'Affectation</DialogTitle>
          <DialogDescription>
            Modifiez la matière ou le coefficient de l'affectation
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Modifier
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
