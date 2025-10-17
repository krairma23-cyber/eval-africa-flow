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
import { UserX, Save } from "lucide-react";
import { logError } from "@/lib/logger";

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  result?: {
    id: string;
    score: number | null;
    is_absent: boolean;
    comment: string | null;
  };
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
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchStudentsAndResults();
    }
  }, [open, assessmentId]);

  const fetchStudentsAndResults = async () => {
    try {
      setLoading(true);
      
      // Get classroom from assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .select(`
          classroom_subject_id,
          classroom_subjects(classroom_id)
        `)
        .eq("id", assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      const classroomId = assessment.classroom_subjects.classroom_id;

      // Get students enrolled in the classroom
      const { data: enrollments, error: enrollmentError } = await supabase
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
        .eq("status", "active");

      if (enrollmentError) throw enrollmentError;

      // Get existing results
      const { data: results, error: resultsError } = await supabase
        .from("assessment_results")
        .select("*")
        .eq("assessment_id", assessmentId);

      if (resultsError) throw resultsError;

      // Combine students with their results
      const studentsWithResults = enrollments.map((enrollment: any) => {
        const student = enrollment.students;
        const result = results?.find((r: any) => r.student_id === student.id);
        
        return {
          ...student,
          result: result || null,
        };
      });

      setStudents(studentsWithResults);
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
              id: student.result?.id || "",
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
              id: student.result?.id || "",
              score: isAbsent ? null : student.result?.score || null,
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
              id: student.result?.id || "",
              score: student.result?.score || null,
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare data for upsert
      const resultsToSave = students
        .filter((student) => student.result && (student.result.score !== null || student.result.is_absent))
        .map((student) => {
          const hasExistingResult = student.result?.id && student.result.id.length > 0;
          const resultData: any = {
            assessment_id: assessmentId,
            student_id: student.id,
            score: student.result?.score,
            is_absent: student.result?.is_absent || false,
            comment: student.result?.comment,
            graded_by: user.id,
            graded_at: new Date().toISOString(),
          };

          // Only include id for existing results (updates)
          if (hasExistingResult) {
            resultData.id = student.result.id;
          }

          return resultData;
        });

      if (resultsToSave.length === 0) {
        toast({
          title: "Aucune note à enregistrer",
          description: "Veuillez saisir au moins une note ou marquer un élève absent",
        });
        return;
      }

      const { error } = await supabase
        .from("assessment_results")
        .upsert(resultsToSave);

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
        description: "Impossible d'enregistrer les notes",
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
                </div>

                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    max={maxScore}
                    step="0.5"
                    value={student.result?.score ?? ""}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                    disabled={student.result?.is_absent}
                    placeholder="Note"
                    className="w-full"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2 pt-2">
                  <Checkbox
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
                    value={student.result?.comment || ""}
                    onChange={(e) => handleCommentChange(student.id, e.target.value)}
                    placeholder="Commentaire optionnel..."
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer les notes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
