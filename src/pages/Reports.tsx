import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, FileText, Download, Calendar } from "lucide-react";
import { GenerateReportsDialog } from "@/components/forms/GenerateReportsDialog";

interface ReportCard {
  id: string;
  generated_at: string | null;
  overall_average: number | null;
  general_comment: string | null;
  pdf_url: string | null;
  students: {
    first_name: string;
    last_name: string;
  };
  classrooms: {
    name: string;
  };
  terms: {
    name: string;
  };
}

export default function Reports() {
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('report_cards')
        .select(`
          id,
          generated_at,
          overall_average,
          general_comment,
          pdf_url,
          students (
            first_name,
            last_name
          ),
          classrooms (
            name
          ),
          terms (
            name
          )
        `)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les bulletins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) =>
    `${report.students.first_name} ${report.students.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.classrooms.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.terms?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getTermColor = (termName: string) => {
    if (termName.includes("1")) return "default";
    if (termName.includes("2")) return "secondary";
    if (termName.includes("3")) return "outline";
    return "default";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulletins</h1>
        <p className="text-muted-foreground">
          Consultez et générez les bulletins scolaires
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un bulletin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <GenerateReportsDialog onReportsGenerated={fetchReports}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Générer des bulletins
          </Button>
        </GenerateReportsDialog>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun bulletin trouvé</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Aucun bulletin ne correspond à votre recherche" : "Commencez par générer vos premiers bulletins"}
          </p>
          <GenerateReportsDialog onReportsGenerated={fetchReports}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Générer des bulletins
            </Button>
          </GenerateReportsDialog>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">
                    {report.students.first_name} {report.students.last_name}
                  </span>
                  <Badge variant={getTermColor(report.terms?.name || '')}>
                    {report.terms?.name || 'N/A'}
                  </Badge>
                </CardTitle>
                <CardDescription className="space-y-1">
                  <div>{report.classrooms.name}</div>
                  {report.overall_average !== null && (
                    <div className="font-medium text-primary">
                      Moyenne: {report.overall_average.toFixed(2)}/20
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.generated_at && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Généré le {formatDate(report.generated_at)}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    if (report.pdf_url) {
                      window.open(report.pdf_url, '_blank');
                    } else {
                      toast({
                        title: "PDF non disponible",
                        description: "Le PDF du bulletin n'est pas encore généré",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le bulletin
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}