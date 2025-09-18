import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, FileText, Download, Calendar } from "lucide-react";

interface Report {
  id: string;
  period: string;
  school_year: string;
  generated_at: string;
  created_at: string;
  students: {
    first_name: string;
    last_name: string;
  };
  classrooms: {
    name: string;
  };
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Since reports table doesn't exist yet, we'll use a placeholder
      const data: Report[] = [];
      const error = null;

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
    report.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getPeriodColor = (period: string) => {
    switch (period.toLowerCase()) {
      case "trimestre 1":
        return "default";
      case "trimestre 2":
        return "secondary";
      case "trimestre 3":
        return "outline";
      default:
        return "default";
    }
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Générer des bulletins
        </Button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun bulletin trouvé</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Aucun bulletin ne correspond à votre recherche" : "Commencez par générer vos premiers bulletins"}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Générer des bulletins
          </Button>
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
                  <Badge variant={getPeriodColor(report.period)}>
                    {report.period}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {report.classrooms.name} • {report.school_year}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Généré le {formatDate(report.generated_at)}
                </div>
                <Button variant="outline" size="sm" className="w-full">
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