import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";
import { Switch } from "@/components/ui/switch";

interface AddTermDialogProps {
  onTermAdded: () => void;
  children: React.ReactNode;
}

interface AcademicYear {
  id: string;
  name: string;
}

export function AddTermDialog({ onTermAdded, children }: AddTermDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [userSchoolId, setUserSchoolId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    term_number: "",
    academic_year_id: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.school_id) {
          setUserSchoolId(profile.school_id);

          const { data: years } = await supabase
            .from('academic_years')
            .select('id, name')
            .eq('school_id', profile.school_id)
            .order('name', { ascending: false });

          setAcademicYears(years || []);
        }
      } catch (error) {
        await logError('Failed to fetch data', error, {
          component: 'AddTermDialog',
          action: 'FETCH_DATA'
        });
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSchoolId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('terms').insert([{
        ...formData,
        school_id: userSchoolId,
        term_number: parseInt(formData.term_number),
      }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Trimestre ajouté avec succès",
      });

      setFormData({
        name: "",
        term_number: "",
        academic_year_id: "",
        start_date: "",
        end_date: "",
        is_current: false,
      });
      setOpen(false);
      onTermAdded();
    } catch (error) {
      await logError('Failed to add term', error, {
        component: 'AddTermDialog',
        action: 'ADD_TERM'
      });
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le trimestre",
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
          <DialogTitle>Ajouter un trimestre</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="academic_year_id">Année académique *</Label>
            <Select
              value={formData.academic_year_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'année" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="term_number">Numéro du trimestre *</Label>
            <Select
              value={formData.term_number}
              onValueChange={(value) => setFormData(prev => ({ ...prev, term_number: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le trimestre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Trimestre 1</SelectItem>
                <SelectItem value="2">Trimestre 2</SelectItem>
                <SelectItem value="3">Trimestre 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="name">Nom du trimestre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Premier Trimestre 2025"
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
            <Button type="submit" disabled={loading || !userSchoolId}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
