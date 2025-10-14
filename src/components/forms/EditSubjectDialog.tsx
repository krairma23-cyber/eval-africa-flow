import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  code: z.string().min(1, "Le code est requis"),
  description: z.string().optional(),
});

interface EditSubjectDialogProps {
  subject: {
    id: string;
    name: string;
    code: string;
    description: string | null;
  };
  onSubjectUpdated: () => void;
  children: React.ReactNode;
}

export function EditSubjectDialog({
  subject,
  onSubjectUpdated,
  children,
}: EditSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("subjects")
        .update({
          name: values.name,
          code: values.code,
          description: values.description || null,
        })
        .eq("id", subject.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Matière modifiée avec succès",
      });

      setOpen(false);
      onSubjectUpdated();
    } catch (error) {
      await logError("Failed to update subject", error, {
        component: "EditSubjectDialog",
        action: "UPDATE_SUBJECT",
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier la matière",
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
          <DialogTitle>Modifier la matière</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la matière
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la matière</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mathématiques" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: MATH" {...field} />
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
                    <Textarea
                      placeholder="Description de la matière"
                      {...field}
                    />
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
