import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, TrendingUp, Calendar, User, LogOut, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentReport {
  id: string;
  student_name: string;
  class_name: string;
  term: string;
  average: number;
  rank: number;
  total_students: number;
  date: string;
}

export default function ParentPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllReports, setShowAllReports] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
      loadReports();
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
    // TODO: Charger les vrais rapports depuis la base de données
    // Pour l'instant, données de démonstration
    setReports([
      {
        id: "1",
        student_name: "Jean Kouadio",
        class_name: "6ème A",
        term: "1er Trimestre 2024-2025",
        average: 14.5,
        rank: 3,
        total_students: 35,
        date: "2024-12-15",
      },
      {
        id: "2",
        student_name: "Jean Kouadio",
        class_name: "6ème A",
        term: "2ème Trimestre 2024-2025",
        average: 15.2,
        rank: 2,
        total_students: 35,
        date: "2025-03-20",
      },
    ]);
  };

  const downloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      toast({
        title: "Téléchargement démarré",
        description: `Bulletin de ${report.student_name} - ${report.term}`,
      });
      // TODO: Implémenter le vrai téléchargement PDF depuis la base de données
      console.log("Downloading report:", reportId);
    }
  };

  const filteredReports = reports.filter(report =>
    report.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.term.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Élève</p>
                <p className="text-2xl font-bold">Jean Kouadio</p>
                <p className="text-sm text-muted-foreground">6ème A</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moyenne Générale</p>
                <p className="text-2xl font-bold">15.2/20</p>
                <p className="text-sm text-green-600">↑ +0.7 points</p>
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
                <p className="text-2xl font-bold">2/35</p>
                <p className="text-sm text-muted-foreground">élèves</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Reports Section */}
        <div className="space-y-6">
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

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Moyenne</p>
                        <p className="text-xl font-bold text-primary">{report.average}/20</p>
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
                  </div>

                  <Button onClick={() => downloadReport(report.id)}>
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
        </div>

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
              onClick={() => window.open("mailto:contact@evalscol.ci?subject=Contact École")}
            >
              Contacter l'École
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
