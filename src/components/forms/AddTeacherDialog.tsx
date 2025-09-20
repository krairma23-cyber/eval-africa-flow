import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddTeacherDialogProps {
  onTeacherAdded: () => void;
  children: React.ReactNode;
}

export function AddTeacherDialog({ onTeacherAdded, children }: AddTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teacher_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization: "",
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
          } else {
            toast({
              title: "Erreur",
              description: "Votre profil n'est pas associé à une école. Contactez l'administrateur.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer votre profil utilisateur.",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchUserProfile();
    }
  }, [open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacher_number || !formData.first_name || !formData.last_name) {
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
        description: "Impossible de déterminer votre école. Contactez l'administrateur.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('teachers').insert([{
        ...formData,
        school_id: userSchoolId,
      }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Enseignant ajouté avec succès",
      });
      
      setFormData({
        teacher_number: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        specialization: "",
      });
      setOpen(false);
      onTeacherAdded();
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'enseignant",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un enseignant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="teacher_number">Numéro d'enseignant *</Label>
            <Input
              id="teacher_number"
              value={formData.teacher_number}
              onChange={(e) => setFormData(prev => ({ ...prev, teacher_number: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="first_name">Prénom *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Nom *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="specialization">Spécialisation</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
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