import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, ClipboardCheck, Shield, Lock } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SchoolTestimonials } from "@/components/testimonials/SchoolTestimonials";
import { LocalSupport } from "@/components/features/LocalSupport";
import { EvaluationFeatures } from "@/components/features/EvaluationFeatures";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            EvalScol
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Plateforme sécurisée de gestion des évaluations scolaires
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>Authentification sécurisée</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
          {/* Left Column - Features */}
          <div className="space-y-6 order-2 lg:order-1">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">Fonctionnalités principales</h2>
              <div className="grid gap-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Users className="h-8 w-8 text-primary shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-lg">Gestion des élèves</CardTitle>
                        <CardDescription className="mt-1">
                          Inscriptions, données personnelles et suivi complet des élèves en toute sécurité
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-8 w-8 text-accent shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-lg">Enseignants</CardTitle>
                        <CardDescription className="mt-1">
                          Gestion du personnel enseignant, affectations et suivis pédagogiques
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="h-8 w-8 text-primary shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-lg">Évaluations</CardTitle>
                        <CardDescription className="mt-1">
                          Création, gestion et analyse des évaluations avec stockage sécurisé
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-8 w-8 text-accent shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-lg">Bulletins</CardTitle>
                        <CardDescription className="mt-1">
                          Génération automatique des bulletins scolaires et rapports détaillés
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* Security Notice */}
            <Card className="bg-accent/5 border-accent/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-accent mb-2">Sécurité et confidentialité</h3>
                    <p className="text-sm text-muted-foreground">
                      Toutes vos données sont stockées de manière sécurisée dans notre infrastructure Supabase. 
                      Authentification renforcée, chiffrement des données sensibles et audit complet des actions utilisateurs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Authentication Form */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-8">
            <LoginForm />
          </div>
        </div>

        {/* Evaluation and Analytics Features */}
        <EvaluationFeatures />

        {/* Testimonials Section */}
        <SchoolTestimonials />

        {/* Local Support Section */}
        <LocalSupport />
      </div>
    </div>
  );
};

export default Index;
