import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { Switch } from "@/components/ui/switch";

interface EditTermDialogProps {
  term: {
    id: string;
    name: string;
    term_number: number;
    start_date: string;
    end_date: string;
    is_current: boolean;
  };
  onTermUpdated: () => void;
  children: React.ReactNode;
}

export function EditTermDialog({ term, onTermUpdated, children }: EditTermDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: term.name,
    start_date: term.start_date,
    end_date: term.end_date,
    is_current: term.is_current,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFormData({
        name: term.name,
        start_date: term.start_date,
        end_date: term.end_date,
        is_current: term.is_current,
      });
    }
  }, [open, term]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('terms')
        .update(formData)
        .eq('id', term.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Trimestre modifié avec succès",
      });

      setOpen(false);
      onTermUpdated();
    } catch (error) {
      await logError('Failed to update term', error, {
        component: 'EditTermDialog',
        action: 'UPDATE_TERM'
      });
      toast({
        title: "Erreur",
        description: "Impossible de modifier le trimestre",
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
          <DialogTitle>Modifier le trimestre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du trimestre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="start_date">Date de début *</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">Date de fin *</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_current"
              checked={formData.is_current}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_current: checked }))}
            />
            <Label htmlFor="is_current">Trimestre en cours</Label>
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
