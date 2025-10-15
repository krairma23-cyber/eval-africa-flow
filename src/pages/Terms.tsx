import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTermDialog } from "@/components/forms/AddTermDialog";
import { EditTermDialog } from "@/components/forms/EditTermDialog";

interface Term {
  id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  academic_year_id: string;
  academic_years: {
    name: string;
  };
}

export default function Terms() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('terms')
        .select(`
          *,
          academic_years(name)
        `)
        .order('academic_year_id', { ascending: false })
        .order('term_number', { ascending: true });

      if (error) throw error;
      setTerms(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les trimestres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Trimestres
          </h1>
          <p className="text-muted-foreground">
            Gestion des périodes scolaires
          </p>
        </div>
        <AddTermDialog onTermAdded={fetchTerms}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un trimestre
          </Button>
        </AddTermDialog>
      </div>

      {terms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun trimestre trouvé</h3>
            <p className="text-muted-foreground text-center mb-4">
              Commencez par ajouter des trimestres pour votre année académique
            </p>
            <AddTermDialog onTermAdded={fetchTerms}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter le premier trimestre
              </Button>
            </AddTermDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {terms.map((term) => (
            <Card key={term.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{term.name}</span>
                  {term.is_current && (
                    <Badge variant="default">En cours</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Année:</strong> {term.academic_years.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Du:</strong> {formatDate(term.start_date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Au:</strong> {formatDate(term.end_date)}
                </p>
                <Badge variant="secondary">
                  Trimestre {term.term_number}
                </Badge>
                <div className="pt-2">
                  <EditTermDialog term={term} onTermUpdated={fetchTerms}>
                    <Button variant="outline" size="sm" className="w-full">
                      Modifier
                    </Button>
                  </EditTermDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
