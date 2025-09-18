import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddClassroomDialogProps {
  onClassroomAdded: () => void;
  children: React.ReactNode;
}

export function AddClassroomDialog({ onClassroomAdded, children }: AddClassroomDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
  });
  const { toast } = useToast();

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

    setLoading(true);
    try {
      // First, we need to get or create a campus
      let campusId = '00000000-0000-0000-0000-000000000001'; // Default campus
      
      const { error } = await supabase.from('classrooms').insert([{
        name: formData.name,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        campus_id: campusId,
        grade_level_id: '00000000-0000-0000-0000-000000000001', // Default grade level
        academic_year_id: '00000000-0000-0000-0000-000000000001', // Default academic year
      }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Classe ajoutée avec succès",
      });
      
      setFormData({
        name: "",
        capacity: "",
      });
      setOpen(false);
      onClassroomAdded();
    } catch (error) {
      console.error('Error adding classroom:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la classe",
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}