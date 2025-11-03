import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const studentSchema = z.object({
  student_number: z.string().trim().min(1, "Le numéro d'élève est requis").max(50),
  first_name: z.string().trim().min(1, "Le prénom est requis").max(100),
  last_name: z.string().trim().min(1, "Le nom est requis").max(100),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  parent_name: z.string().trim().max(200).optional(),
  parent_phone: z.string()
    .trim()
    .regex(/^[\d\s\-+()]*$/, "Format de téléphone invalide")
    .min(10, "Le numéro doit contenir au moins 10 chiffres")
    .max(20, "Le numéro ne peut pas dépasser 20 caractères")
    .optional()
    .or(z.literal("")),
  parent_email: z.string()
    .trim()
    .email("Format d'email invalide")
    .max(254, "L'email ne peut pas dépasser 254 caractères")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(500).optional(),
});

interface AddStudentDialogProps {
  onStudentAdded: () => void;
  children: React.ReactNode;
}

export function AddStudentDialog({ onStudentAdded, children }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [canAddStudent, setCanAddStudent] = useState(true);
  const [planInfo, setPlanInfo] = useState<{ currentStudents: number; maxStudents: number; planName: string } | null>(null);
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
  const navigate = useNavigate();

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
            
            // Check plan limits
            const { data: features } = await supabase
              .from('user_plan_features')
              .select('plan_id, max_students')
              .eq('user_id', user.id)
              .single();

            const { count: studentCount } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('school_id', profile.school_id);

            const maxStudents = features?.max_students || 30;
            const currentStudents = studentCount || 0;
            const planNames: Record<string, string> = {
              starter: 'Starter',
              professional: 'Professional',
              enterprise: 'Enterprise'
            };

            setPlanInfo({
              currentStudents,
              maxStudents,
              planName: planNames[features?.plan_id || 'starter'] || 'Starter'
            });

            // Block if limit reached
            if (currentStudents >= maxStudents) {
              setCanAddStudent(false);
              toast({
                title: "Limite atteinte",
                description: `Vous avez atteint la limite de ${maxStudents} élèves de votre plan ${planNames[features?.plan_id || 'starter']}. Mettez à niveau pour continuer.`,
                variant: "destructive",
              });
            } else {
              setCanAddStudent(true);
            }
            
            // Générer un matricule automatique
            const year = new Date().getFullYear().toString().slice(-2);
            const nextNumber = currentStudents + 1;
            const studentNumber = `EL${year}${nextNumber.toString().padStart(4, '0')}`;
            
            setFormData(prev => ({ ...prev, student_number: studentNumber }));
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
    
    // Check if can add student
    if (!canAddStudent) {
      toast({
        title: "Limite du plan atteinte",
        description: `Vous ne pouvez pas ajouter plus d'élèves. Mettez à niveau votre plan pour continuer.`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate form data
    try {
      studentSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
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
        const filePath = `students/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase.from('students').insert([{
        ...formData,
        school_id: userSchoolId,
        avatar_url: avatarUrl,
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
      setAvatarFile(null);
      setAvatarPreview(null);
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
        
        {!canAddStudent && planInfo && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Limite du plan atteinte</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Vous avez atteint la limite de <strong>{planInfo.maxStudents} élèves</strong> de votre plan{" "}
                <strong>{planInfo.planName}</strong> ({planInfo.currentStudents}/{planInfo.maxStudents}).
              </p>
              <Button 
                onClick={() => {
                  setOpen(false);
                  navigate('/billing');
                }}
                variant="default"
                size="sm"
                className="w-full"
              >
                Mettre à niveau maintenant
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
            <Label htmlFor="student_number">Matricule *</Label>
            <Input
              id="student_number"
              value={formData.student_number}
              onChange={(e) => setFormData(prev => ({ ...prev, student_number: e.target.value }))}
              required
              placeholder="Généré automatiquement"
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
            <Button type="submit" disabled={loading || !userSchoolId || !canAddStudent}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}