// Update this page (the content is just a fallback if you fail to update the page)

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, ClipboardCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
            <GraduationCap className="h-12 w-12" />
            EvalScol
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Système moderne de gestion des évaluations scolaires pour les établissements d'enseignement
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Créer un compte</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Gestion des élèves</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Inscriptions, données personnelles et suivi des élèves
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <GraduationCap className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Enseignants</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestion du personnel enseignant et des affectations
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <ClipboardCheck className="h-12 w-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Évaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Création et gestion des évaluations et notes
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 mx-auto text-orange-600 mb-2" />
              <CardTitle>Bulletins</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Génération automatique des bulletins scolaires
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-muted-foreground mb-8">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Accéder à EvalScol</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
