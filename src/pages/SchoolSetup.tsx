import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, School, Users, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SetupStatus {
  schoolConfigured: boolean;
  teachersAdded: boolean;
  studentsAdded: boolean;
}

export default function SchoolSetup() {
  const [status, setStatus] = useState<SetupStatus>({
    schoolConfigured: false,
    teachersAdded: false,
    studentsAdded: false,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.school_id) {
        setLoading(false);
        return;
      }

      // Vérifier si l'école est configurée
      const { data: school } = await supabase
        .from('schools')
        .select('name, address, phone, email')
        .eq('id', profile.school_id)
        .single();

      const schoolConfigured = !!(
        school?.name &&
        school?.address &&
        school?.phone &&
        school?.email
      );

      // Vérifier si des enseignants sont ajoutés
      const { count: teachersCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile.school_id);

      // Vérifier si des élèves sont ajoutés
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', profile.school_id);

      setStatus({
        schoolConfigured,
        teachersAdded: (teachersCount || 0) > 0,
        studentsAdded: (studentsCount || 0) > 0,
      });

      // Si tout est configuré, rediriger vers le dashboard
      if (schoolConfigured && teachersCount && studentsCount) {
        toast({
          title: "Configuration terminée",
          description: "Votre établissement est prêt à être utilisé",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le statut de configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    const completed = [
      status.schoolConfigured,
      status.teachersAdded,
      status.studentsAdded,
    ].filter(Boolean).length;
    return (completed / 3) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Configuration de votre établissement</h1>
        <p className="text-muted-foreground text-lg">
          Complétez ces étapes pour commencer à utiliser EvalScol
        </p>
        <div className="space-y-2">
          <Progress value={getProgress()} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {Math.round(getProgress())}% complété
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Étape 1: Informations de l'école */}
        <Card className={status.schoolConfigured ? "border-green-500" : "border-orange-500"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status.schoolConfigured ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <Circle className="h-8 w-8 text-orange-500" />
                )}
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Étape 1: Informations de l'établissement
                  </CardTitle>
                  <CardDescription>
                    {status.schoolConfigured
                      ? "Configuration complétée ✓"
                      : "Renseignez les informations de votre école"}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Configurez le nom, l'adresse, les coordonnées et le logo de votre établissement.
              </p>
              <Button
                onClick={() => navigate('/dashboard/settings')}
                variant={status.schoolConfigured ? "outline" : "default"}
              >
                {status.schoolConfigured ? "Modifier" : "Configurer maintenant"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Étape 2: Enseignants */}
        <Card className={status.teachersAdded ? "border-green-500" : "border-orange-500"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status.teachersAdded ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <Circle className="h-8 w-8 text-orange-500" />
                )}
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Étape 2: Enseignants
                  </CardTitle>
                  <CardDescription>
                    {status.teachersAdded
                      ? "Au moins un enseignant ajouté ✓"
                      : "Ajoutez vos enseignants"}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enregistrez les informations de tous les enseignants de votre établissement.
              </p>
              <Button
                onClick={() => navigate('/dashboard/teachers')}
                variant={status.teachersAdded ? "outline" : "default"}
              >
                {status.teachersAdded ? "Gérer les enseignants" : "Ajouter des enseignants"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Étape 3: Élèves */}
        <Card className={status.studentsAdded ? "border-green-500" : "border-orange-500"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status.studentsAdded ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : (
                  <Circle className="h-8 w-8 text-orange-500" />
                )}
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Étape 3: Élèves
                  </CardTitle>
                  <CardDescription>
                    {status.studentsAdded
                      ? "Au moins un élève ajouté ✓"
                      : "Ajoutez vos élèves"}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Inscrivez tous les élèves avec leurs informations personnelles et de contact.
              </p>
              <Button
                onClick={() => navigate('/dashboard/students')}
                variant={status.studentsAdded ? "outline" : "default"}
              >
                {status.studentsAdded ? "Gérer les élèves" : "Ajouter des élèves"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {status.schoolConfigured && status.teachersAdded && status.studentsAdded && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Configuration terminée !
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Votre établissement est maintenant prêt à utiliser toutes les fonctionnalités d'EvalScol.
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')} size="lg">
                Accéder au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
