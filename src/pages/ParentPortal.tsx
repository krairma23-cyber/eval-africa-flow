import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, TrendingUp, Calendar, User, LogOut, Search, CreditCard, DollarSign, Check, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logError } from "@/lib/logger";
import { calculateRankings } from "@/lib/ranking-utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TuitionPaymentDialog } from "@/components/payment/TuitionPaymentDialog";
import { StudentSchedule } from "@/components/parent/StudentSchedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubjectGrade {
  subject_name: string;
  avg_score: number;
  coefficient: number;
  weighted_score: number;
}

interface StudentReport {
  id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  term: string;
  term_id: string;
  average: number;
  rank: number;
  total_students: number;
  date: string;
  subject_grades: SubjectGrade[];
  classroom_id?: string;
}

interface StudentPaymentInfo {
  student_id: string;
  student_name: string;
  tuition_fee: number;
  amount_paid: number;
  payment_status: string;
}

export default function ParentPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<StudentPaymentInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllReports, setShowAllReports] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const paymentSuccess = searchParams.get('payment');
    if (paymentSuccess === 'success' && isAuthenticated) {
      toast({
        title: "Paiement en cours de traitement",
        description: "Votre paiement est en cours de vérification...",
      });
      setTimeout(() => {
        loadReports();
      }, 2000);
    }
  }, [searchParams, isAuthenticated]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
      loadReports();
      loadPaymentInfo();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parentEmail,
        password: parentPassword,
      });

      if (error) throw error;

      setIsAuthenticated(true);
      loadReports();
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur le portail parent",
      });
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setReports([]);
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt!",
    });
  };

  const loadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Loading reports securely
      if (!user?.email) return;

      // Récupérer les élèves liés à cet email parent
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          school_id,
          enrollments (
            id,
            classroom_id,
            academic_year_id,
            classrooms (
              name,
              campus_id,
              campuses (
                school_id
              )
            )
          )
        `)
        .eq('parent_email', user.email);

      if (studentsError) throw studentsError;
      // Students retrieved successfully
      if (!students || students.length === 0) {
        // No students found
        setReports([]);
        return;
      }

      // Pour chaque élève, récupérer ses bulletins
      const allReports: StudentReport[] = [];

      for (const student of students) {
        const enrollment = student.enrollments?.[0];
        if (!enrollment) continue;

        const { data: terms, error: termsError } = await supabase
          .from('terms')
          .select('id, name, school_id')
          .eq('school_id', student.school_id)
          .order('created_at', { ascending: false });

        if (termsError) continue;

        for (const term of terms || []) {
          // Récupérer toutes les notes de l'élève pour cette période
          const { data: assessmentResults } = await supabase
            .from('assessment_results')
            .select(`
              id,
              score,
              assessments (
                id,
                classroom_subject_id,
                term_id,
                coefficient,
                classroom_subjects (
                  coefficient,
                  subjects (
                    name
                  )
                )
              )
            `)
            .eq('student_id', student.id)
            .not('score', 'is', null);

          // Filtrer les résultats pour ce terme
          const termResults = assessmentResults?.filter(
            r => r.assessments?.term_id === term.id
          ) || [];

          if (termResults.length === 0) {
            // Créer un bulletin vide pour les élèves sans notes
            allReports.push({
              id: `${student.id}-${term.id}`,
              student_id: student.id,
              student_name: `${student.first_name} ${student.last_name}`,
              class_name: enrollment.classrooms?.name || 'Classe inconnue',
              term: term.name,
              term_id: term.id,
              average: 0,
              rank: 0,
              total_students: 0, // Will be set after calculating all students
              date: new Date().toISOString(),
              subject_grades: [],
              classroom_id: enrollment.classroom_id
            });
            continue;
          }

          // Calculer la moyenne par matière
          const subjectGrades: { [key: string]: SubjectGrade } = {};

          termResults.forEach(result => {
            const subject = result.assessments?.classroom_subjects?.subjects;
            const subjectName = subject?.name || 'Matière inconnue';
            const coefficient = result.assessments?.classroom_subjects?.coefficient || 1;
            const score = result.score || 0;

            if (!subjectGrades[subjectName]) {
              subjectGrades[subjectName] = {
                subject_name: subjectName,
                avg_score: 0,
                coefficient: coefficient,
                weighted_score: 0
              };
            }

            subjectGrades[subjectName].avg_score += score;
          });

          // Calculer les moyennes et notes pondérées
          const subjectArray = Object.values(subjectGrades).map(subject => {
            const count = termResults.filter(
              r => r.assessments?.classroom_subjects?.subjects?.name === subject.subject_name
            ).length;
            subject.avg_score = subject.avg_score / count;
            subject.weighted_score = subject.avg_score * subject.coefficient;
            return subject;
          });

          // Calculer la moyenne générale
          const totalWeighted = subjectArray.reduce((sum, s) => sum + s.weighted_score, 0);
          const totalCoeff = subjectArray.reduce((sum, s) => sum + s.coefficient, 0);
          const overallAverage = totalCoeff > 0 ? totalWeighted / totalCoeff : 0;

          // Get total students count
          const { count: totalStudents } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('classroom_id', enrollment.classroom_id)
            .eq('status', 'active');

          allReports.push({
            id: `${student.id}-${term.id}`,
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            class_name: enrollment.classrooms?.name || 'Classe inconnue',
            term: term.name,
            term_id: term.id,
            average: overallAverage,
            rank: 0, // Will be calculated after all reports are loaded
            total_students: totalStudents || 0,
            date: new Date().toISOString(),
            subject_grades: subjectArray,
            classroom_id: enrollment.classroom_id
          });
        }
      }

      // Calculate rankings for each class and term combination
      const classTermGroups: { [key: string]: StudentReport[] } = {};
      
      allReports.forEach(report => {
        const key = `${report.classroom_id}-${report.term_id}`;
        if (!classTermGroups[key]) {
          classTermGroups[key] = [];
        }
        classTermGroups[key].push(report);
      });

      // Calculate rankings within each group and update total_students
      Object.values(classTermGroups).forEach(group => {
        const studentsData = group.map(r => ({
          student_id: r.student_id,
          average: r.average
        }));

        const rankings = calculateRankings(studentsData);

        group.forEach(report => {
          const ranking = rankings.find(r => r.student_id === report.student_id);
          if (ranking) {
            report.rank = ranking.rank;
          }
          report.total_students = group.length;
        });
      });

      // Reports loaded with rankings
      setReports(allReports);
    } catch (error) {
      logError('Reports loading failed', error, {
        component: 'ParentPortal',
        action: 'load_reports'
      });
      toast({
        title: "Erreur",
        description: "Impossible de charger les bulletins",
        variant: "destructive",
      });
    }
  };

  const loadPaymentInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data: students, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, tuition_fee, amount_paid, payment_status')
        .eq('parent_email', user.email);

      if (error) throw error;

      const payments: StudentPaymentInfo[] = (students || []).map(s => ({
        student_id: s.id,
        student_name: `${s.first_name} ${s.last_name}`,
        tuition_fee: s.tuition_fee || 0,
        amount_paid: s.amount_paid || 0,
        payment_status: s.payment_status || 'unpaid'
      }));

      setPaymentInfo(payments);
    } catch (error) {
      logError('Payment info loading failed', error, {
        component: 'ParentPortal',
        action: 'load_payment_info'
      });
    }
  };

  const downloadReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    try {
      const doc = new jsPDF();
      
      // Add logo
      try {
        const logoUrl = '/evalscol-logo.png';
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        doc.addImage(img, 'PNG', 160, 8, 30, 30);
      } catch (error) {
        console.error('Error loading logo:', error);
      }
      
      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("BULLETIN SCOLAIRE", 105, 20, { align: "center" });
      
      // Student info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Élève: ${report.student_name}`, 20, 35);
      doc.text(`Classe: ${report.class_name}`, 20, 42);
      doc.text(`Période: ${report.term}`, 20, 49);
      
      // Overall average
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const avgColor = report.average >= 10 ? [0, 128, 0] : [255, 0, 0];
      doc.setTextColor(avgColor[0], avgColor[1], avgColor[2]);
      doc.text(`Moyenne Générale: ${report.average.toFixed(2)}/20`, 20, 60);
      doc.setTextColor(0, 0, 0);
      
      // Appreciation
      let appreciation = "Insuffisant";
      if (report.average >= 16) appreciation = "Excellent";
      else if (report.average >= 14) appreciation = "Très bien";
      else if (report.average >= 12) appreciation = "Bien";
      else if (report.average >= 10) appreciation = "Passable";
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.text(`Appréciation: ${appreciation}`, 20, 68);
      doc.text(`Rang: ${report.rank}/${report.total_students}`, 20, 75);
      
      // Subject grades table
      if (report.subject_grades && report.subject_grades.length > 0) {
        const tableData = report.subject_grades.map(subject => [
          subject.subject_name,
          subject.avg_score.toFixed(2),
          subject.coefficient.toString(),
          subject.weighted_score.toFixed(2)
        ]);
        
        autoTable(doc, {
          startY: 82,
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
      }
      
      // Save PDF
      doc.save(`Bulletin_${report.student_name.replace(/\s/g, '_')}_${report.term.replace(/\s/g, '_')}.pdf`);
      
      toast({
        title: "Succès",
        description: `Bulletin de ${report.student_name} téléchargé`,
      });
    } catch (error) {
      logError('PDF generation failed', error, {
        component: 'ParentPortal',
        action: 'generate_pdf'
      });
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const matches = report.student_name.toLowerCase().includes(query) ||
      report.class_name.toLowerCase().includes(query) ||
      report.term.toLowerCase().includes(query);
    
    return matches;
  });
  
  const displayedReports = showAllReports ? filteredReports : filteredReports.slice(0, 2);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-20 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold mb-2">Portail Parent</h1>
            <p className="text-muted-foreground">
              Connectez-vous pour accéder aux bulletins de votre enfant
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@exemple.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-center text-sm">
              <Button 
                type="button" 
                variant="link" 
                onClick={() => navigate("/")}
              >
                Retour à l'accueil
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">Portail Parent</h1>
              <p className="text-muted-foreground">Suivi scolaire de votre enfant</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </header>

        {/* Payment Section */}
        {paymentInfo.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Frais de Scolarité</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {paymentInfo.map((payment) => (
                <Card key={payment.student_id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{payment.student_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {payment.payment_status === 'paid' ? 'Payé' : 
                             payment.payment_status === 'partial' ? 'Paiement partiel' : 
                             'Non payé'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Frais totaux</span>
                          <span className="font-semibold">{payment.tuition_fee.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Déjà payé</span>
                          <span className="font-semibold text-green-600">{payment.amount_paid.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        {payment.tuition_fee > payment.amount_paid && (
                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground">Reste à payer</span>
                            <span className="font-bold text-red-600">
                              {(payment.tuition_fee - payment.amount_paid).toLocaleString('fr-FR')} FCFA
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {payment.tuition_fee > payment.amount_paid ? (
                    <TuitionPaymentDialog
                      studentId={payment.student_id}
                      studentName={payment.student_name}
                      tuitionFee={payment.tuition_fee}
                      amountPaid={payment.amount_paid}
                      paymentStatus={payment.payment_status}
                      onPaymentCompleted={loadPaymentInfo}
                    >
                      <Button className="w-full">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Payer maintenant
                      </Button>
                    </TuitionPaymentDialog>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Frais de scolarité payés
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {reports.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Élève</p>
                  <p className="text-2xl font-bold">{reports[0].student_name}</p>
                  <p className="text-sm text-muted-foreground">{reports[0].class_name}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dernière Moyenne</p>
                  <p className="text-2xl font-bold">{reports[0].average.toFixed(2)}/20</p>
                  {reports.length > 1 && (
                    <p className={`text-sm ${reports[0].average >= reports[1].average ? 'text-green-600' : 'text-red-600'}`}>
                      {reports[0].average >= reports[1].average ? '↑' : '↓'} 
                      {' '}{Math.abs(reports[0].average - reports[1].average).toFixed(1)} points
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classement</p>
                  <p className="text-2xl font-bold">{reports[0].rank}/{reports[0].total_students}</p>
                  <p className="text-sm text-muted-foreground">élèves</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs Section - Reports and Schedule */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="reports">Bulletins Scolaires</TabsTrigger>
            <TabsTrigger value="schedule">Emploi du Temps</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-bold">Bulletins Scolaires</h2>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom d'élève..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowAllReports(!showAllReports)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {showAllReports ? "Voir Récents" : "Historique Complet"}
              </Button>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "Aucun bulletin trouvé pour cette recherche" 
                  : "Aucun bulletin disponible pour le moment"}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {displayedReports.map((report) => (
              <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{report.term}</h3>
                        <p className="text-sm text-muted-foreground">{report.class_name}</p>
                      </div>
                    </div>

                    {report.average > 0 ? (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Moyenne</p>
                          <p className="text-xl font-bold text-primary">{report.average.toFixed(2)}/20</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rang</p>
                          <p className="text-xl font-bold">{report.rank}/{report.total_students}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="text-sm font-medium">{new Date(report.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Aucune note disponible pour cette période
                        </p>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => downloadReport(report.id)}
                    disabled={report.average === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </Button>
                </div>
              </Card>
              ))}
            </div>
          )}

          {!showAllReports && filteredReports.length > 2 && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAllReports(true)}
              >
                Voir tous les bulletins ({filteredReports.length})
              </Button>
            </div>
          )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {reports.length > 0 && reports[0].classroom_id ? (
              <StudentSchedule 
                classroomId={reports[0].classroom_id} 
                studentName={reports[0].student_name}
              />
            ) : (
              <Card className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucun emploi du temps disponible pour le moment
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8 p-6 bg-accent/5 border-accent/30">
          <h3 className="font-semibold text-lg mb-3">Besoin d'aide ?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Consultez notre guide parent ou contactez l'administration de l'école pour toute question.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/parent-guide")}>
              Guide Parents
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open("mailto:contact@evalscol.com?subject=Contact École")}
            >
              Contacter l'École
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
