import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { calculateRankings } from "@/lib/ranking-utils";

interface ViewClassRankingsDialogProps {
  classroomId: string;
  classroomName: string;
  children: React.ReactNode;
}

interface StudentAverage {
  student_id: string;
  student_name: string;
  average: number;
  rank: number;
}

export function ViewClassRankingsDialog({ classroomId, classroomName, children }: ViewClassRankingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [rankings, setRankings] = useState<StudentAverage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTerms();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTerm) {
      fetchRankings();
    }
  }, [selectedTerm]);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from("terms")
        .select("id, name")
        .order("term_number");

      if (error) throw error;

      if (data && data.length > 0) {
        setTerms(data);
        setSelectedTerm(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les périodes",
        variant: "destructive",
      });
    }
  };

  const fetchRankings = async () => {
    try {
      setLoading(true);

      // Get all students in this classroom
      const { data: enrollments, error: enrollError } = await supabase
        .from("enrollments")
        .select(`
          student_id,
          students!inner(
            id,
            first_name,
            last_name
          )
        `)
        .eq("classroom_id", classroomId)
        .eq("status", "active");

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setRankings([]);
        return;
      }

      // Calculate averages for each student
      const studentAverages: Array<{ student_id: string; student_name: string; average: number }> = [];

      for (const enrollment of enrollments) {
        const studentId = enrollment.student_id;
        const studentName = `${enrollment.students.first_name} ${enrollment.students.last_name}`;

        // Get all assessment results for this student in this term
        const { data: results, error: resultsError } = await supabase
          .from("assessment_results")
          .select(`
            score,
            assessments!inner(
              max_score,
              coefficient,
              term_id,
              classroom_subjects!inner(
                classroom_id,
                subjects(name),
                coefficient
              )
            )
          `)
          .eq("student_id", studentId)
          .eq("assessments.term_id", selectedTerm)
          .eq("assessments.classroom_subjects.classroom_id", classroomId)
          .eq("is_absent", false)
          .not("score", "is", null);

        if (resultsError) throw resultsError;

        if (!results || results.length === 0) {
          studentAverages.push({
            student_id: studentId,
            student_name: studentName,
            average: 0,
          });
          continue;
        }

        // Calculate average by subject
        const subjectScores: { [key: string]: { total: number; count: number; coefficient: number } } = {};

        results.forEach((result: any) => {
          const subjectName = result.assessments.classroom_subjects.subjects.name;
          const normalizedScore = (result.score / result.assessments.max_score) * 20;
          const coefficient = result.assessments.classroom_subjects.coefficient || 1;

          if (!subjectScores[subjectName]) {
            subjectScores[subjectName] = { total: 0, count: 0, coefficient };
          }

          subjectScores[subjectName].total += normalizedScore;
          subjectScores[subjectName].count += 1;
        });

        // Calculate weighted average
        let totalWeighted = 0;
        let totalCoeff = 0;

        Object.values(subjectScores).forEach((subject) => {
          const subjectAvg = subject.total / subject.count;
          totalWeighted += subjectAvg * subject.coefficient;
          totalCoeff += subject.coefficient;
        });

        const overallAverage = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;

        studentAverages.push({
          student_id: studentId,
          student_name: studentName,
          average: overallAverage,
        });
      }

      // Calculate rankings
      const rankedStudents = calculateRankings(studentAverages);
      
      const finalRankings: StudentAverage[] = rankedStudents.map(ranking => {
        const student = studentAverages.find(s => s.student_id === ranking.student_id)!;
        return {
          student_id: ranking.student_id,
          student_name: student.student_name,
          average: ranking.average,
          rank: ranking.rank,
        };
      });

      setRankings(finalRankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le classement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getAverageColor = (avg: number) => {
    if (avg >= 16) return "text-green-600 dark:text-green-400";
    if (avg >= 14) return "text-blue-600 dark:text-blue-400";
    if (avg >= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAverageBadge = (avg: number) => {
    if (avg >= 16) return <Badge className="bg-green-600">Excellent</Badge>;
    if (avg >= 14) return <Badge className="bg-blue-600">Très bien</Badge>;
    if (avg >= 12) return <Badge className="bg-indigo-600">Bien</Badge>;
    if (avg >= 10) return <Badge variant="secondary">Passable</Badge>;
    return <Badge variant="destructive">Insuffisant</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Classement - {classroomName}
          </DialogTitle>
          <DialogDescription>
            Classement des élèves par moyenne générale
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Période:</label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sélectionner une période" />
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

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucune note disponible pour cette période</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rang</TableHead>
                    <TableHead>Élève</TableHead>
                    <TableHead className="text-center">Moyenne</TableHead>
                    <TableHead className="text-center">Appréciation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(student.rank)}
                          <span className="font-bold text-lg">{student.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{student.student_name}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold text-lg ${getAverageColor(student.average)}`}>
                          {student.average.toFixed(2)}/20
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{getAverageBadge(student.average)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {rankings.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
              <span>Total: {rankings.length} élève(s)</span>
              <span>
                Moyenne de classe:{" "}
                <span className="font-medium">
                  {(rankings.reduce((sum, s) => sum + s.average, 0) / rankings.length).toFixed(2)}/20
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
