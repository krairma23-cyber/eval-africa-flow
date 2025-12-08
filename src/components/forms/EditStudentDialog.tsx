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
import { Upload, X } from "lucide-react";
import { z } from "zod";

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

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  address: string;
  avatar_url: string | null;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  doctor_name?: string;
  doctor_phone?: string;
  medical_notes?: string;
}

interface EditStudentDialogProps {
  student: Student;
  onStudentUpdated: () => void;
  children: React.ReactNode;
}

export function EditStudentDialog({ student, onStudentUpdated, children }: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(student.avatar_url);
  const [formData, setFormData] = useState({
    student_number: student.student_number || "",
    first_name: student.first_name || "",
    last_name: student.last_name || "",
    date_of_birth: student.date_of_birth || "",
    gender: student.gender || "",
    parent_name: student.parent_name || "",
    parent_phone: student.parent_phone || "",
    parent_email: student.parent_email || "",
    address: student.address || "",
    blood_type: student.blood_type || "",
    allergies: student.allergies || "",
    medical_conditions: student.medical_conditions || "",
    medications: student.medications || "",
    emergency_contact_name: student.emergency_contact_name || "",
    emergency_contact_phone: student.emergency_contact_phone || "",
    doctor_name: student.doctor_name || "",
    doctor_phone: student.doctor_phone || "",
    medical_notes: student.medical_notes || "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFormData({
        student_number: student.student_number || "",
        first_name: student.first_name || "",
        last_name: student.last_name || "",
        date_of_birth: student.date_of_birth || "",
        gender: student.gender || "",
        parent_name: student.parent_name || "",
        parent_phone: student.parent_phone || "",
        parent_email: student.parent_email || "",
        address: student.address || "",
        blood_type: student.blood_type || "",
        allergies: student.allergies || "",
        medical_conditions: student.medical_conditions || "",
        medications: student.medications || "",
        emergency_contact_name: student.emergency_contact_name || "",
        emergency_contact_phone: student.emergency_contact_phone || "",
        doctor_name: student.doctor_name || "",
        doctor_phone: student.doctor_phone || "",
        medical_notes: student.medical_notes || "",
      });
      setAvatarPreview(student.avatar_url);
      setAvatarFile(null);
    }
  }, [open, student]);

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

    setLoading(true);
    try {
      let avatarUrl = student.avatar_url;

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

      const { error } = await supabase
        .from('students')
        .update({
          ...formData,
          avatar_url: avatarUrl,
        })
        .eq('id', student.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Élève modifié avec succès",
      });
      
      setOpen(false);
      onStudentUpdated();
    } catch (error) {
      await logError('Failed to update student', error, {
        component: 'EditStudentDialog',
        action: 'UPDATE_STUDENT'
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'élève",
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
          <DialogTitle>Modifier l'élève</DialogTitle>
        </DialogHeader>
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
                    Changer la photo
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

          {/* Medical Information Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-red-500">⚕️</span> Informations médicales
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blood_type">Groupe sanguin</Label>
                <Select value={formData.blood_type} onValueChange={(value) => setFormData(prev => ({ ...prev, blood_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="emergency_contact_name">Contact d'urgence</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                  placeholder="Nom du contact"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="emergency_contact_phone">Tél. urgence</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  placeholder="+225 XX XX XX XX"
                />
              </div>
              <div>
                <Label htmlFor="doctor_name">Médecin traitant</Label>
                <Input
                  id="doctor_name"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                  placeholder="Nom du médecin"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="doctor_phone">Téléphone du médecin</Label>
              <Input
                id="doctor_phone"
                value={formData.doctor_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, doctor_phone: e.target.value }))}
                placeholder="+225 XX XX XX XX"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="allergies">Allergies connues</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                placeholder="Ex: arachides, pénicilline, pollen..."
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="medical_conditions">Conditions médicales</Label>
              <Input
                id="medical_conditions"
                value={formData.medical_conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_conditions: e.target.value }))}
                placeholder="Ex: asthme, diabète, épilepsie..."
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="medications">Médicaments en cours</Label>
              <Input
                id="medications"
                value={formData.medications}
                onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                placeholder="Traitements en cours"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="medical_notes">Notes médicales supplémentaires</Label>
              <Input
                id="medical_notes"
                value={formData.medical_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, medical_notes: e.target.value }))}
                placeholder="Autres informations importantes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
