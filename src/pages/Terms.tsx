import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, LockKeyhole } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTermDialog } from "@/components/forms/AddTermDialog";
import { EditTermDialog } from "@/components/forms/EditTermDialog";
import { useRole } from "@/hooks/useRole";
import { termGradesClosed } from "@/lib/grade-security";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface Term {
  id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
  academic_year_id: string;
  grades_closed_at: string | null;
  academic_years: {
    name: string;
  };
}

export default function Terms() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { roles } = useRole();
  const isAdmin = roles.includes("admin");
  const [closingTerm, setClosingTerm] = useState<Term | null>(null);
  const [closing, setClosing] = useState(false);

  const closeGrades = async () => {
    if (!closingTerm || closing) return;
    setClosing(true);
    const { error } = await supabase.rpc("close_term_grades", { p_term_id: closingTerm.id });
    setClosing(false);
    if (error) { toast({ title: "Clôture impossible", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Notes de la période clôturées" });
    setClosingTerm(null);
    fetchTerms();
  };

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
                {termGradesClosed(term) && <Badge variant="outline" className="ml-2"><LockKeyhole className="h-3 w-3 mr-1" />Notes clôturées</Badge>}
                <div className="pt-2">
                  <EditTermDialog term={term} onTermUpdated={fetchTerms}>
                    <Button variant="outline" size="sm" className="w-full" disabled={termGradesClosed(term)}>
                      Modifier
                    </Button>
                  </EditTermDialog>
                  {isAdmin && !termGradesClosed(term) && <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setClosingTerm(term)}><LockKeyhole className="h-4 w-4 mr-2" />Clôturer les notes</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog open={Boolean(closingTerm)} onOpenChange={open => { if (!open && !closing) setClosingTerm(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Clôturer {closingTerm?.name} ?</AlertDialogTitle><AlertDialogDescription>Aucune nouvelle note ne pourra être saisie pour cette période. La clôture est définitive. Les corrections resteront réservées à la direction, avec motif et historique.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={closing}>Annuler</AlertDialogCancel><AlertDialogAction disabled={closing} onClick={event => { event.preventDefault(); closeGrades(); }}>{closing ? "Clôture…" : "Clôturer définitivement"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
