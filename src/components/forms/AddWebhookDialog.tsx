import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

const webhookSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  url: z.string().url("URL invalide"),
  events: z.array(z.string()).min(1, "Sélectionnez au moins un événement"),
});

const WEBHOOK_EVENTS = [
  { id: "student.created", label: "Élève créé" },
  { id: "student.updated", label: "Élève modifié" },
  { id: "student.deleted", label: "Élève supprimé" },
  { id: "assessment.created", label: "Évaluation créée" },
  { id: "assessment.graded", label: "Notes saisies" },
  { id: "payment.completed", label: "Paiement effectué" },
];

interface AddWebhookDialogProps {
  onSuccess: () => void;
}

export default function AddWebhookDialog({ onSuccess }: AddWebhookDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof webhookSchema>>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      url: "",
      events: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof webhookSchema>) => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.school_id) {
        toast({
          title: "Erreur",
          description: "Profil introuvable",
          variant: "destructive",
        });
        return;
      }

      // Generate a random secret for the webhook
      const secret = crypto.randomUUID();

      const { error } = await supabase.from("webhooks").insert({
        school_id: profile.school_id,
        user_id: user.id,
        name: values.name,
        url: values.url,
        events: values.events,
        secret: secret,
      });

      if (error) throw error;

      toast({
        title: "Webhook créé",
        description: `Le webhook "${values.name}" a été créé avec succès`,
      });

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Configurer webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouveau Webhook</DialogTitle>
          <DialogDescription>
            Configurez un webhook pour recevoir des notifications en temps réel
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du webhook</FormLabel>
                  <FormControl>
                    <Input placeholder="Mon webhook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du webhook</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/webhook" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL où les événements seront envoyés
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="events"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Événements</FormLabel>
                    <FormDescription>
                      Sélectionnez les événements à surveiller
                    </FormDescription>
                  </div>
                  {WEBHOOK_EVENTS.map((event) => (
                    <FormField
                      key={event.id}
                      control={form.control}
                      name="events"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={event.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(event.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, event.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== event.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {event.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer le webhook"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
