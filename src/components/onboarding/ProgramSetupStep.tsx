import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ProgramSetupStepProps {
  onNext: () => void;
  onBack: () => void;
  onDataChange: (data: any) => void;
  initialData: any;
  schoolData: any;
}

const DEFAULT_PROGRAMS = [
  { name: "Enseignement Primaire", levels: ["CP", "CE1", "CE2", "CM1", "CM2"] },
  { name: "Collège", levels: ["6ème", "5ème", "4ème", "3ème"] },
  { name: "Lycée Général", levels: ["Seconde", "Première", "Terminale"] },
];

const DEFAULT_SUBJECTS = [
  "Mathématiques", "Français", "Anglais", "Histoire-Géographie",
  "Sciences de la Vie et de la Terre", "Physique-Chimie",
  "Éducation Physique et Sportive", "Arts Plastiques"
];

export function ProgramSetupStep({ onNext, onBack, onDataChange, initialData, schoolData }: ProgramSetupStepProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(
    initialData?.programs || []
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialData?.subjects || DEFAULT_SUBJECTS
  );
  const { toast } = useToast();

  const handleProgramToggle = (programName: string) => {
    setSelectedPrograms(prev =>
      prev.includes(programName)
        ? prev.filter(p => p !== programName)
        : [...prev, programName]
    );
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPrograms.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un programme",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create programs and their levels
      for (const programName of selectedPrograms) {
        const program = DEFAULT_PROGRAMS.find(p => p.name === programName);
        if (!program) continue;

        const { data: createdProgram, error: programError } = await supabase
          .from("programs")
          .insert({
            school_id: schoolData.id,
            name: program.name,
          })
          .select()
          .single();

        if (programError) throw programError;

        // Create grade levels for this program
        for (let i = 0; i < program.levels.length; i++) {
          const { error: levelError } = await supabase
            .from("grade_levels")
            .insert({
              program_id: createdProgram.id,
              name: program.levels[i],
              level_order: i + 1,
            });

          if (levelError) throw levelError;
        }
      }

      // Create subjects
      for (const subject of selectedSubjects) {
        const { error: subjectError } = await supabase
          .from("subjects")
          .insert({
            school_id: schoolData.id,
            name: subject,
            code: subject.substring(0, 4).toUpperCase(),
          });

        if (subjectError) throw subjectError;
      }

      onDataChange({ programs: selectedPrograms, subjects: selectedSubjects });
      toast({
        title: "Configuration enregistrée",
        description: "Les programmes et matières ont été créés",
      });
      onNext();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Programmes et matières</h2>
        <p className="text-muted-foreground mt-2">
          Sélectionnez les programmes enseignés et les matières principales
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Programmes enseignés *
          </Label>
          <div className="space-y-3">
            {DEFAULT_PROGRAMS.map((program) => (
              <div key={program.name} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                <Checkbox
                  id={program.name}
                  checked={selectedPrograms.includes(program.name)}
                  onCheckedChange={() => handleProgramToggle(program.name)}
                />
                <div className="flex-1">
                  <label htmlFor={program.name} className="font-medium cursor-pointer">
                    {program.name}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Niveaux: {program.levels.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">
            Matières enseignées
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_SUBJECTS.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  checked={selectedSubjects.includes(subject)}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                />
                <label htmlFor={subject} className="text-sm cursor-pointer">
                  {subject}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Vous pourrez ajouter d'autres matières plus tard
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Création..." : "Continuer"}
        </Button>
      </div>
    </form>
  );
}