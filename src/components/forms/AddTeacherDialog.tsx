import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, X } from "lucide-react";

interface AddTeacherDialogProps {
  onTeacherAdded: () => void;
  children: React.ReactNode;
}

export function AddTeacherDialog({ onTeacherAdded, children }: AddTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
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
        await logError('Failed to fetch user profile', error, {
          component: 'AddTeacherDialog',
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      let avatarUrl = null;

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `teachers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase.from('teachers').insert([{
        ...formData,
        school_id: userSchoolId,
        avatar_url: avatarUrl,
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
      setAvatarFile(null);
      setAvatarPreview(null);
      setOpen(false);
      onTeacherAdded();
    } catch (error) {
      await logError('Failed to add teacher', error, {
        component: 'AddTeacherDialog',
        action: 'ADD_TEACHER'
      });
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
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-4 mb-4">
              <Avatar className="h-24 w-24">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} />
                ) : (
                  <AvatarFallback>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex gap-2">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir une photo
                    </span>
                  </Button>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </Label>
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}