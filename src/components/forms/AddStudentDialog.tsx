import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

interface AddStudentDialogProps {
  onStudentAdded: () => void;
  children: React.ReactNode;
}

export function AddStudentDialog({ onStudentAdded, children }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    student_number: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
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
        await logError('Failed to fetch user profile', error, {
          component: 'AddStudentDialog',
          action: 'FETCH_PROFILE'
        });
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
    if (!formData.student_number || !formData.first_name || !formData.last_name) {
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
      const { error } = await supabase.from('students').insert([{
        ...formData,
        school_id: userSchoolId,
      }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Élève ajouté avec succès",
      });
      
      setFormData({
        student_number: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        address: "",
      });
      setOpen(false);
      onStudentAdded();
    } catch (error) {
      await logError('Failed to add student', error, {
        component: 'AddStudentDialog',
        action: 'ADD_STUDENT'
      });
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'élève",
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un élève</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student_number">Numéro d'élève *</Label>
            <Input
              id="student_number"
              value={formData.student_number}
              onChange={(e) => setFormData(prev => ({ ...prev, student_number: e.target.value }))}
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
            <Label htmlFor="date_of_birth">Date de naissance</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="gender">Genre</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="parent_name">Nom du parent/tuteur</Label>
            <Input
              id="parent_name"
              value={formData.parent_name}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="parent_phone">Téléphone du parent</Label>
            <Input
              id="parent_phone"
              value={formData.parent_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="parent_email">Email du parent</Label>
            <Input
              id="parent_email"
              type="email"
              value={formData.parent_email}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_email: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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