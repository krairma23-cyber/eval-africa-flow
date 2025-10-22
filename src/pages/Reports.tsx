import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StudentGrade {
  student_id: string;
  student_first_name: string;
  student_last_name: string;
  classroom_name: string;
  term_name: string;
  subject_grades: {
    subject_name: string;
    avg_score: number;
    max_score: number;
    coefficient: number;
    weighted_score: number;
  }[];
  overall_average: number;
}

export default function Reports() {
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const [terms, setTerms] = useState<{id: string, name: string}[]>([]);
  const [classrooms, setClassrooms] = useState<{id: string, name: string}[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch terms and classrooms for filters
      const [termsRes, classroomsRes] = await Promise.all([
        supabase.from('terms').select('id, name').order('term_number'),
        supabase.from('classrooms').select('id, name').order('name')
      ]);

      if (termsRes.data) setTerms(termsRes.data);
      if (classroomsRes.data) setClassrooms(classroomsRes.data);

      // Fetch all assessment results with student, classroom, subject info
      const { data: results, error } = await supabase
        .from('assessment_results')
        .select(`
          *,
          students!inner(id, first_name, last_name),
          assessments!inner(
            classroom_subject_id,
            term_id,
            coefficient,
            max_score,
            classroom_subjects!inner(
              subjects(name),
              classrooms(id, name)
            ),
            terms(id, name)
          )
        `)
        .eq('is_absent', false)
        .not('score', 'is', null);

      if (error) throw error;

      // Group results by student and term
      const groupedGrades = new Map<string, StudentGrade>();

      results?.forEach((result: any) => {
        const key = `${result.students.id}-${result.assessments.terms.id}`;
        
        if (!groupedGrades.has(key)) {
          groupedGrades.set(key, {
            student_id: result.students.id,
            student_first_name: result.students.first_name,
            student_last_name: result.students.last_name,
            classroom_name: result.assessments.classroom_subjects.classrooms.name,
            term_name: result.assessments.terms.name,
            subject_grades: [],
            overall_average: 0
          });
        }

        const studentGrade = groupedGrades.get(key)!;
        const subjectName = result.assessments.classroom_subjects.subjects.name;
        
        // Check if subject already exists
        let subjectGrade = studentGrade.subject_grades.find(sg => sg.subject_name === subjectName);
        
        if (!subjectGrade) {
          subjectGrade = {
            subject_name: subjectName,
            avg_score: 0,
            max_score: result.assessments.max_score,
            coefficient: result.assessments.coefficient,
            weighted_score: 0
          };
          studentGrade.subject_grades.push(subjectGrade);
        }

        // Calculate average for this subject (simple average of all assessments)
        const normalizedScore = (result.score / result.assessments.max_score) * 20;
        subjectGrade.avg_score = normalizedScore;
        subjectGrade.weighted_score = normalizedScore * subjectGrade.coefficient;
      });

      // Calculate overall averages
      const gradesArray = Array.from(groupedGrades.values());
      gradesArray.forEach(studentGrade => {
        const totalWeighted = studentGrade.subject_grades.reduce((sum, sg) => sum + sg.weighted_score, 0);
        const totalCoeff = studentGrade.subject_grades.reduce((sum, sg) => sum + sg.coefficient, 0);
        studentGrade.overall_average = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;
      });

      setStudentGrades(gradesArray);
    } catch (error) {
      console.error("Error fetching student grades:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les bulletins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = studentGrades.filter((grade) => {
    const matchesSearch = `${grade.student_first_name} ${grade.student_last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.classroom_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTerm = selectedTerm === "all" || grade.term_name === terms.find(t => t.id === selectedTerm)?.name;
    const matchesClassroom = selectedClassroom === "all" || grade.classroom_name === classrooms.find(c => c.id === selectedClassroom)?.name;

    return matchesSearch && matchesTerm && matchesClassroom;
  });

  const getAverageColor = (avg: number) => {
    if (avg >= 16) return "text-green-600 dark:text-green-400";
    if (avg >= 14) return "text-blue-600 dark:text-blue-400";
    if (avg >= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAverageBadge = (avg: number) => {
    if (avg >= 16) return <Badge variant="default" className="bg-green-600">Excellent</Badge>;
    if (avg >= 14) return <Badge variant="default" className="bg-blue-600">Très bien</Badge>;
    if (avg >= 12) return <Badge variant="default" className="bg-indigo-600">Bien</Badge>;
    if (avg >= 10) return <Badge variant="secondary">Passable</Badge>;
    return <Badge variant="destructive">Insuffisant</Badge>;
  };

  const exportToPDF = (grade: StudentGrade) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETIN SCOLAIRE", 105, 20, { align: "center" });
      
      // Student info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Élève: ${grade.student_first_name} ${grade.student_last_name}`, 20, 35);
      doc.text(`Classe: ${grade.classroom_name}`, 20, 42);
      doc.text(`Période: ${grade.term_name}`, 20, 49);
      
      // Overall average
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const avgColor = grade.overall_average >= 10 ? [0, 128, 0] : [255, 0, 0];
      doc.setTextColor(avgColor[0], avgColor[1], avgColor[2]);
      doc.text(`Moyenne Générale: ${grade.overall_average.toFixed(2)}/20`, 20, 60);
      doc.setTextColor(0, 0, 0);
      
      // Appreciation
      let appreciation = "Insuffisant";
      if (grade.overall_average >= 16) appreciation = "Excellent";
      else if (grade.overall_average >= 14) appreciation = "Très bien";
      else if (grade.overall_average >= 12) appreciation = "Bien";
      else if (grade.overall_average >= 10) appreciation = "Passable";
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.text(`Appréciation: ${appreciation}`, 20, 68);
      
      // Subject grades table
      const tableData = grade.subject_grades.map(subject => [
        subject.subject_name,
        subject.avg_score.toFixed(2),
        subject.coefficient.toString(),
        subject.weighted_score.toFixed(2)
      ]);
      
      autoTable(doc, {
        startY: 75,
        head: [["Matière", "Note /20", "Coefficient", "Note pondérée"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], fontStyle: "bold" },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 40, halign: "center" }
        }
      });
      
      // Footer
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 20, finalY + 15);
      
      // Save PDF
      doc.save(`Bulletin_${grade.student_first_name}_${grade.student_last_name}_${grade.term_name}.pdf`);
      
      toast({
        title: "Succès",
        description: `Bulletin de ${grade.student_first_name} ${grade.student_last_name} téléchargé`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulletins et Moyennes</h1>
        <p className="text-muted-foreground">
          Consultez les moyennes et bulletins scolaires par élève et par période
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les périodes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les périodes</SelectItem>
            {terms.map(term => (
              <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {classrooms.map(classroom => (
              <SelectItem key={classroom.id} value={classroom.id}>{classroom.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredGrades.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun bulletin trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedTerm !== "all" || selectedClassroom !== "all"
                ? "Aucun bulletin ne correspond à vos filtres"
                : "Les notes doivent d'abord être saisies dans les évaluations"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="cards" className="w-full">
          <TabsList>
            <TabsTrigger value="cards">Vue par élève</TabsTrigger>
            <TabsTrigger value="table">Vue tableau</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGrades.map((grade, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="truncate">
                        {grade.student_first_name} {grade.student_last_name}
                      </span>
                      {getAverageBadge(grade.overall_average)}
                    </CardTitle>
                    <CardDescription>
                      {grade.classroom_name} • {grade.term_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Moyenne générale</span>
                      <span className={`text-2xl font-bold ${getAverageColor(grade.overall_average)}`}>
                        {grade.overall_average.toFixed(2)}/20
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Moyennes par matière</p>
                      {grade.subject_grades.slice(0, 3).map((subject, subIdx) => (
                        <div key={subIdx} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate flex-1">{subject.subject_name}</span>
                          <span className={`font-medium ${getAverageColor(subject.avg_score)}`}>
                            {subject.avg_score.toFixed(1)}/20
                          </span>
                        </div>
                      ))}
                      {grade.subject_grades.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{grade.subject_grades.length - 3} autre(s) matière(s)
                        </p>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => exportToPDF(grade)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le bulletin
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Élève</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Nb Matières</TableHead>
                      <TableHead>Moyenne générale</TableHead>
                      <TableHead>Appréciation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {grade.student_first_name} {grade.student_last_name}
                        </TableCell>
                        <TableCell>{grade.classroom_name}</TableCell>
                        <TableCell>{grade.term_name}</TableCell>
                        <TableCell>{grade.subject_grades.length}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${getAverageColor(grade.overall_average)}`}>
                            {grade.overall_average.toFixed(2)}/20
                          </span>
                        </TableCell>
                        <TableCell>
                          {getAverageBadge(grade.overall_average)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => exportToPDF(grade)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}