import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

interface AddClassroomDialogProps {
  onClassroomAdded: () => void;
  children: React.ReactNode;
}

export function AddClassroomDialog({ onClassroomAdded, children }: AddClassroomDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    color: "#3b82f6",
  });

  const predefinedColors = [
    { name: "Bleu", value: "#3b82f6" },
    { name: "Rouge", value: "#ef4444" },
    { name: "Vert", value: "#10b981" },
    { name: "Jaune", value: "#f59e0b" },
    { name: "Orange", value: "#f97316" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Rose", value: "#ec4899" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Fuchsia", value: "#d946ef" },
    { name: "Lime", value: "#84cc16" },
    { name: "Emeraude", value: "#059669" },
    { name: "Ambre", value: "#f59e0b" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Pourpre", value: "#a855f7" },
    { name: "Marron", value: "#92400e" },
    { name: "Gris", value: "#6b7280" },
    { name: "Bleu Ciel", value: "#0ea5e9" },
    { name: "Corail", value: "#ff6b6b" },
    { name: "Noir", value: "#000000" },
  ];
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
          component: 'AddClassroomDialog',
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
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom de la classe",
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
      // Get or create a campus
      let { data: campus } = await supabase
        .from('campuses')
        .select('id')
        .eq('school_id', userSchoolId)
        .maybeSingle();

      if (!campus) {
        const { data: newCampus, error: campusError } = await supabase
          .from('campuses')
          .insert([{ name: 'Campus Principal', school_id: userSchoolId }])
          .select('id')
          .single();
        
        if (campusError) throw campusError;
        campus = newCampus;
      }

      // Get or create academic year
      let { data: academicYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('school_id', userSchoolId)
        .eq('is_current', true)
        .maybeSingle();

      if (!academicYear) {
        const { data: newYear, error: yearError } = await supabase
          .from('academic_years')
          .insert([{
            name: '2025-2026',
            school_id: userSchoolId,
            start_date: '2025-09-01',
            end_date: '2026-06-30',
            is_current: true
          }])
          .select('id')
          .single();
        
        if (yearError) throw yearError;
        academicYear = newYear;
      }

      // Get or create a default program and grade level
      let { data: program } = await supabase
        .from('programs')
        .select('id')
        .eq('school_id', userSchoolId)
        .maybeSingle();

      if (!program) {
        const { data: newProgram, error: programError } = await supabase
          .from('programs')
          .insert([{ name: 'Programme Général', school_id: userSchoolId }])
          .select('id')
          .single();
        
        if (programError) throw programError;
        program = newProgram;
      }

      let { data: gradeLevel } = await supabase
        .from('grade_levels')
        .select('id')
        .eq('program_id', program.id)
        .maybeSingle();

      if (!gradeLevel) {
        const { data: newGrade, error: gradeError } = await supabase
          .from('grade_levels')
          .insert([{
            name: 'Niveau 1',
            program_id: program.id,
            level_order: 1
          }])
          .select('id')
          .single();
        
        if (gradeError) throw gradeError;
        gradeLevel = newGrade;
      }

      const { error } = await supabase.from('classrooms').insert([{
        name: formData.name,
        capacity: formData.capacity ? parseInt(formData.capacity) : 30,
        campus_id: campus.id,
        grade_level_id: gradeLevel.id,
        academic_year_id: academicYear.id,
        color: formData.color,
      }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Classe ajoutée avec succès",
      });
      
      setFormData({
        name: "",
        capacity: "",
        color: "#3b82f6",
      });
      setOpen(false);
      onClassroomAdded();
    } catch (error) {
      await logError('Failed to add classroom', error, { component: 'AddClassroomDialog', action: 'ADD_CLASSROOM' });
      toast({ title: "Erreur", description: "Impossible d'ajouter la classe", variant: "destructive" });
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
          <DialogTitle>Ajouter une classe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la classe *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex: 6ème A, CM2 B"
              required
            />
          </div>
          <div>
            <Label htmlFor="capacity">Capacité (nombre d'élèves)</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              placeholder="ex: 30"
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="color">Couleur de la classe</Label>
            <div className="grid grid-cols-10 gap-2 mt-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: color.value,
                    borderColor: formData.color === color.value ? "#000" : "transparent"
                  }}
                  title={color.name}
                />
              ))}
            </div>
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