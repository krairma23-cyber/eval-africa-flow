import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

interface GenerateReportsDialogProps {
  onReportsGenerated: () => void;
  children: React.ReactNode;
}

interface Classroom {
  id: string;
  name: string;
}

interface Term {
  id: string;
  name: string;
}

export function GenerateReportsDialog({ onReportsGenerated, children }: GenerateReportsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [classroomsResult, termsResult] = await Promise.all([
        supabase.from('classrooms').select('id, name').order('name'),
        supabase.from('terms').select('id, name').order('name')
      ]);

      if (classroomsResult.data) setClassrooms(classroomsResult.data);
      if (termsResult.data) setTerms(termsResult.data);
    } catch (error) {
      await logError('Failed to fetch report data', error, { component: 'GenerateReportsDialog', action: 'FETCH_DATA' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClassrooms.length === 0 || !selectedTerm) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une classe et une période",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate report generation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Succès",
        description: `Bulletins générés pour ${selectedClassrooms.length} classe(s)`,
      });
      
      setSelectedClassrooms([]);
      setSelectedTerm("");
      setOpen(false);
      onReportsGenerated();
    } catch (error) {
      await logError('Failed to generate reports', error, { component: 'GenerateReportsDialog', action: 'GENERATE_REPORTS' });
      toast({ title: "Erreur", description: "Impossible de générer les bulletins", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleClassroom = (classroomId: string) => {
    setSelectedClassrooms(prev => 
      prev.includes(classroomId)
        ? prev.filter(id => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  const selectAllClassrooms = () => {
    setSelectedClassrooms(classrooms.map(c => c.id));
  };

  const deselectAllClassrooms = () => {
    setSelectedClassrooms([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Générer des bulletins</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="term">Période *</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la période" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Classes *</Label>
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAllClassrooms}
                >
                  Tout sélectionner
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={deselectAllClassrooms}
                >
                  Tout désélectionner
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3">
              {classrooms.map((classroom) => (
                <div key={classroom.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={classroom.id}
                    checked={selectedClassrooms.includes(classroom.id)}
                    onCheckedChange={() => toggleClassroom(classroom.id)}
                  />
                  <Label
                    htmlFor={classroom.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {classroom.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedClassrooms.length > 0 && (
              <p>{selectedClassrooms.length} classe(s) sélectionnée(s)</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Génération..." : "Générer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}