import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { UserX, Save, LockKeyhole } from "lucide-react";
import { logError } from "@/lib/logger";
import { fetchAllRows } from "@/lib/fetch-all";
import { useRole } from "@/hooks/useRole";
import { GradeValue, gradeChanged, gradePayload, termGradesClosed } from "@/lib/grade-security";
import { ZodError } from "zod";

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  result?: GradeValue;
}

interface EnterGradesDialogProps {
  assessmentId: string;
  assessmentTitle: string;
  maxScore: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnterGradesDialog({
  assessmentId,
  assessmentTitle,
  maxScore,
  open,
  onOpenChange,
}: EnterGradesDialogProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originals, setOriginals] = useState<Record<string, GradeValue>>({});
  const [corrections, setCorrections] = useState<Record<string, boolean>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [closed, setClosed] = useState(false);
  const { roles, loading: roleLoading } = useRole();
  const isAdmin = roles.includes("admin");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchStudentsAndResults();
    }
  }, [open, assessmentId]);

  const fetchStudentsAndResults = async () => {
    try {
      setLoading(true);
      setCorrections({});
      setReasons({});
      
      // Get classroom from assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .select(`
          classroom_subject_id,
          classroom_subjects(classroom_id),
          terms(end_date, grades_closed_at)
        `)
        .eq("id", assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      const classroomId = assessment.classroom_subjects?.classroom_id;
      if (!classroomId || !assessment.terms) throw new Error("Évaluation introuvable");
      setClosed(termGradesClosed(assessment.terms));

      // Get students enrolled in the classroom
      const { data: enrollments, error: enrollmentError } = await fetchAllRows((from, to) => supabase
        .from("enrollments")
        .select(`
          student_id,
          students(
            id,
            student_number,
            first_name,
            last_name
          )
        `)
        .eq("classroom_id", classroomId)
        .eq("status", "active")
        .order("student_id")
        .range(from, to));

      if (enrollmentError) throw enrollmentError;

      // Get existing results
      const { data: results, error: resultsError } = await fetchAllRows((from, to) => supabase
        .from("assessment_results")
        .select("id, student_id, score, is_absent, comment, updated_at, locked_at")
        .eq("assessment_id", assessmentId)
        .order("id")
        .range(from, to));

      if (resultsError) throw resultsError;

      // Combine students with their results
      const studentsWithResults = enrollments.map((enrollment: any) => {
        const student = enrollment.students;
        const result = results?.find((r: any) => r.student_id === student.id);
        
        return {
          ...student,
          result: result ? { ...result, is_absent: Boolean(result.is_absent) } : null,
        };
      });

      setStudents(studentsWithResults);
      setOriginals(Object.fromEntries(results.map(result => [result.student_id, { ...result, is_absent: Boolean(result.is_absent) }])));
    } catch (error) {
      await logError("Failed to fetch students and results", error, {
        component: "EnterGradesDialog",
        action: "FETCH_STUDENTS_AND_RESULTS"
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les élèves",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, value: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          const score = value === "" ? null : parseFloat(value);
          return {
            ...student,
            result: {
              ...student.result,
              score,
              is_absent: student.result?.is_absent || false,
              comment: student.result?.comment || null,
            },
          };
        }
        return student;
      })
    );
  };

  const handleAbsenceChange = (studentId: string, isAbsent: boolean) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            result: {
              ...student.result,
              score: isAbsent ? null : student.result?.score ?? null,
              is_absent: isAbsent,
              comment: student.result?.comment || null,
            },
          };
        }
        return student;
      })
    );
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          return {
            ...student,
            result: {
              ...student.result,
              score: student.result?.score ?? null,
              is_absent: student.result?.is_absent || false,
              comment: comment || null,
            },
          };
        }
        return student;
      })
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const resultsToSave = students.flatMap(student => {
        const next = student.result;
        if (!next) return [];
        const previous = originals[student.id];
        if (previous) {
          if (!gradeChanged(previous, next)) return [];
          if (!isAdmin || !corrections[student.id]) throw new Error("Correction réservée à la direction.");
        } else if (next.score === null && !next.is_absent) return [];
        return [gradePayload(student.id, next, maxScore, previous, reasons[student.id])];
      });

      if (resultsToSave.length === 0) {
        toast({
          title: "Aucune note à enregistrer",
          description: "Veuillez saisir au moins une note ou marquer un élève absent",
        });
        return;
      }

      const { error } = await supabase.rpc("save_assessment_grades", {
        p_assessment_id: assessmentId,
        p_grades: resultsToSave,
      });

      if (error) throw error;

      toast({
        title: "Notes enregistrées",
        description: `${resultsToSave.length} note(s) enregistrée(s) avec succès`,
      });

      onOpenChange(false);
    } catch (error) {
      await logError("Failed to save grades", error, {
        component: "EnterGradesDialog",
        action: "SAVE_GRADES"
      });
      toast({
        title: "Erreur",
        description: error instanceof ZodError ? "Vérifiez les notes et renseignez un motif pour chaque correction." : error instanceof Error ? error.message : (error as { message?: string })?.message || "Impossible d’enregistrer les notes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saisie des notes - {assessmentTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Note maximale: {maxScore} points
          </p>
          {closed && <p className="text-sm text-destructive flex items-center gap-2"><LockKeyhole className="h-4 w-4" />Période clôturée</p>}
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aucun élève inscrit dans cette classe
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 font-semibold text-sm pb-2 border-b">
              <div className="col-span-3">Élève</div>
              <div className="col-span-2">Note</div>
              <div className="col-span-2">Absent</div>
              <div className="col-span-5">Commentaire</div>
            </div>

            {students.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-12 gap-4 items-start p-3 rounded-lg border bg-card"
              >
                <div className="col-span-3">
                  <p className="font-medium">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    N° {student.student_number}
                  </p>
                  {originals[student.id] && <span className="text-xs text-muted-foreground flex items-center gap-1"><LockKeyhole className="h-3 w-3" />Verrouillée</span>}
                  {originals[student.id] && isAdmin && <div className="flex items-center gap-2 mt-2"><Checkbox id={`correct-${student.id}`} checked={Boolean(corrections[student.id])} onCheckedChange={checked => {
                    setCorrections(prev => ({ ...prev, [student.id]: checked === true }));
                    if (!checked) setStudents(prev => prev.map(s => s.id === student.id ? { ...s, result: { ...originals[student.id] } } : s));
                  }} /><Label htmlFor={`correct-${student.id}`} className="text-xs">Corriger</Label></div>}
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    max={maxScore}
                    step="0.5"
                    value={student.result?.score ?? ""}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                    aria-label={`Note de ${student.first_name} ${student.last_name}`}
                    disabled={saving || roleLoading || student.result?.is_absent || (originals[student.id] ? !isAdmin || !corrections[student.id] : closed)}
                    placeholder="Note"
                    className="w-full"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2 pt-2">
                  <Checkbox
                    disabled={saving || roleLoading || (originals[student.id] ? !isAdmin || !corrections[student.id] : closed)}
                    checked={student.result?.is_absent || false}
                    onCheckedChange={(checked) =>
                      handleAbsenceChange(student.id, checked as boolean)
                    }
                    id={`absent-${student.id}`}
                  />
                  <Label
                    htmlFor={`absent-${student.id}`}
                    className="text-sm cursor-pointer"
                  >
                    Absent
                  </Label>
                </div>

                <div className="col-span-5">
                  <Textarea
                    aria-label={`Commentaire de ${student.first_name} ${student.last_name}`}
                    disabled={saving || roleLoading || (originals[student.id] ? !isAdmin || !corrections[student.id] : closed)}
                    value={student.result?.comment || ""}
                    onChange={(e) => handleCommentChange(student.id, e.target.value)}
                    placeholder="Commentaire optionnel..."
                    className="min-h-[60px]"
                  />
                  {corrections[student.id] && <div className="mt-2 space-y-1"><Label htmlFor={`reason-${student.id}`}>Motif obligatoire</Label><Textarea id={`reason-${student.id}`} value={reasons[student.id] || ""} maxLength={2000} disabled={saving} onChange={e => setReasons(prev => ({ ...prev, [student.id]: e.target.value }))} placeholder="Motif de la correction" /></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || roleLoading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer les notes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
