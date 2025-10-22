import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/lib/logger";

interface AddAssessmentDialogProps {
  onAssessmentAdded: () => void;
  children: React.ReactNode;
}

interface AssessmentType {
  id: string;
  name: string;
}

interface ClassroomSubject {
  id: string;
  subjects: { name: string };
  classrooms: { name: string };
}

interface Term {
  id: string;
  name: string;
}

export function AddAssessmentDialog({ onAssessmentAdded, children }: AddAssessmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [classroomSubjects, setClassroomSubjects] = useState<ClassroomSubject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assessment_date: "",
    max_score: "20",
    coefficient: "1",
    classroom_subject_id: "",
    assessment_type_id: "",
    term_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [typesResult, subjectsResult, termsResult] = await Promise.all([
        supabase.from('assessment_types').select('*').order('name'),
        supabase.from('classroom_subjects').select(`
          *,
          subjects(name),
          classrooms(name)
        `).order('id'),
        supabase.from('terms').select('*').order('name')
      ]);

      if (typesResult.data) setAssessmentTypes(typesResult.data);
      if (subjectsResult.data) setClassroomSubjects(subjectsResult.data);
      if (termsResult.data) setTerms(termsResult.data);
    } catch (error) {
      await logError('Failed to fetch assessment data', error, {
        component: 'AddAssessmentDialog',
        action: 'FETCH_DATA'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification des champs obligatoires avec message spécifique
    const missingFields = [];
    if (!formData.title) missingFields.push("Titre");
    if (!formData.assessment_date) missingFields.push("Date d'évaluation");
    if (!formData.assessment_type_id) missingFields.push("Type d'évaluation");
    if (!formData.classroom_subject_id) missingFields.push("Matière/Classe");
    if (!formData.term_id) missingFields.push("Période");
    
    if (missingFields.length > 0) {
      toast({
        title: "Champs manquants",
        description: `Veuillez remplir : ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        ...formData,
        max_score: parseFloat(formData.max_score),
        coefficient: parseFloat(formData.coefficient),
        // created_by intentionally omitted to avoid FK constraint issues
      };

      const { data, error } = await supabase
        .from('assessments')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Évaluation créée avec succès",
      });
      
      setFormData({
        title: "",
        description: "",
        assessment_date: "",
        max_score: "20",
        coefficient: "1",
        classroom_subject_id: "",
        assessment_type_id: "",
        term_id: "",
      });
      setOpen(false);
      onAssessmentAdded();
    } catch (error) {
      await logError('Failed to add assessment', error, {
        component: 'AddAssessmentDialog',
        action: 'ADD_ASSESSMENT'
      });
      const errMsg = (error as any)?.message || "";
      const isRLS = errMsg.toLowerCase().includes("row-level security");
      toast({
        title: "Erreur",
        description: isRLS
          ? "Accès refusé (RLS). Vérifiez que votre compte appartient à l'école de la classe sélectionnée."
          : (import.meta.env.DEV && errMsg ? `Impossible de créer l'évaluation (${errMsg})` : "Impossible de créer l'évaluation"),
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une évaluation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ex: Contrôle de mathématiques"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de l'évaluation (optionnel)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assessment_date">Date d'évaluation *</Label>
              <Input
                id="assessment_date"
                type="date"
                value={formData.assessment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, assessment_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="max_score">Note maximale *</Label>
              <Input
                id="max_score"
                type="number"
                min="1"
                step="0.5"
                value={formData.max_score}
                onChange={(e) => setFormData(prev => ({ ...prev, max_score: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="coefficient">Coefficient *</Label>
            <Input
              id="coefficient"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.coefficient}
              onChange={(e) => setFormData(prev => ({ ...prev, coefficient: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="assessment_type_id">Type d'évaluation *</Label>
            <Select value={formData.assessment_type_id} onValueChange={(value) => setFormData(prev => ({ ...prev, assessment_type_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {assessmentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="classroom_subject_id">Matière/Classe *</Label>
            <Select value={formData.classroom_subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, classroom_subject_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la matière et classe" />
              </SelectTrigger>
              <SelectContent>
                {classroomSubjects.map((cs) => (
                  <SelectItem key={cs.id} value={cs.id}>
                    {cs.subjects.name} - {cs.classrooms.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="term_id">Période *</Label>
            <Select value={formData.term_id} onValueChange={(value) => setFormData(prev => ({ ...prev, term_id: value }))}>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}