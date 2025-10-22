import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

interface AssessmentType {
  id: string;
  name: string;
  description: string | null;
  default_coefficient: number;
}

interface EditAssessmentTypeDialogProps {
  assessmentType: AssessmentType;
  onAssessmentTypeUpdated: () => void;
  children: React.ReactNode;
}

export function EditAssessmentTypeDialog({
  assessmentType,
  onAssessmentTypeUpdated,
  children,
}: EditAssessmentTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(assessmentType.name);
  const [description, setDescription] = useState(assessmentType.description || "");
  const [defaultCoefficient, setDefaultCoefficient] = useState(assessmentType.default_coefficient.toString());
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du type d'évaluation est requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('assessment_types')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          default_coefficient: parseFloat(defaultCoefficient),
        })
        .eq('id', assessmentType.id);

      if (error) throw error;

      toast({
        title: "Type d'évaluation modifié",
        description: "Le type d'évaluation a été modifié avec succès",
      });

      setOpen(false);
      onAssessmentTypeUpdated();
    } catch (error) {
      await logError('Failed to update assessment type', error, {
        component: 'EditAssessmentTypeDialog',
        action: 'UPDATE_ASSESSMENT_TYPE'
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier le type d'évaluation",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le type d'évaluation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du type *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Devoir, Contrôle, Examen"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description optionnelle du type d'évaluation"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coefficient">Coefficient par défaut *</Label>
            <Input
              id="coefficient"
              type="number"
              step="0.5"
              min="0.5"
              value={defaultCoefficient}
              onChange={(e) => setDefaultCoefficient(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
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
