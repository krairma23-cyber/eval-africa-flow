import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

interface AddSubjectDialogProps {
  onSubjectAdded: () => void;
  children: React.ReactNode;
}

export function AddSubjectDialog({ onSubjectAdded, children }: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('school_id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (profile?.school_id) {
            setUserSchoolId(profile.school_id);
          }
        }
      } catch (error) {
        await logError('Failed to fetch user profile', error, {
          component: 'AddSubjectDialog',
          action: 'FETCH_PROFILE'
        });
      }
    };

    if (open) {
      fetchUserProfile();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (!userSchoolId) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer votre école.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('subjects').insert([{
        ...formData,
        school_id: userSchoolId,
      }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Matière ajoutée avec succès",
      });
      
      setFormData({
        name: "",
        code: "",
        description: "",
      });
      setOpen(false);
      onSubjectAdded();
    } catch (error) {
      await logError('Failed to add subject', error, { component: 'AddSubjectDialog', action: 'ADD_SUBJECT' });
      toast({ title: "Erreur", description: "Impossible d'ajouter la matière", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une matière</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la matière *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex: Mathématiques"
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Code de la matière *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="ex: MATH"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de la matière (optionnel)"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !userSchoolId}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}