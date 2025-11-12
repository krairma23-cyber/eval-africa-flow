import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, ClipboardCheck, Shield, Lock } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SchoolTestimonials } from "@/components/testimonials/SchoolTestimonials";
import { LocalSupport } from "@/components/features/LocalSupport";
import { EvaluationFeatures } from "@/components/features/EvaluationFeatures";
import { ParentReports } from "@/components/features/ParentReports";
import { PressPartners } from "@/components/features/PressPartners";
import { AboutEvalScol } from "@/components/features/AboutEvalScol";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Hero Section */}
        <header className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="EvalScol Logo" 
              className="h-32 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            EvalScol Africa Flow - Plateforme SaaS Complète de Gestion Scolaire en Afrique
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Solution 100% cloud pour établissements en Afrique francophone. De 50 à 1000+ élèves. 
            Gestion complète des élèves, évaluations automatisées, bulletins PDF, portail parent temps réel, 
            paiements mobile money intégrés, IA pour détection élèves à risque. Essai gratuit 14 jours.
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
          <div className="mt-6">
            <AboutEvalScol />
          </div>
        </header>

        {/* Two Column Layout */}
        <main className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
          {/* Left Column - Features */}
          <section className="space-y-6 order-2 lg:order-1">
            <article>
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">Plateforme Éducative Côte d'Ivoire - Gestion Scolaire en Afrique Francophone</h2>
              <div className="grid gap-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Users className="h-8 w-8 text-primary shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">Suivi des Élèves et Gestion Scolaire</CardTitle>
                        <CardDescription className="mt-1">
                          Inscriptions, données personnelles et suivi complet des élèves. Gestion centralisée pour écoles privées et publiques en Côte d'Ivoire et Afrique francophone.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-8 w-8 text-accent shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">Solution Numérique pour Enseignants</CardTitle>
                        <CardDescription className="mt-1">
                          Gestion du personnel enseignant, affectations et suivis pédagogiques. Simplifiez le travail des enseignants avec notre plateforme SaaS éducation.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <ClipboardCheck className="h-8 w-8 text-primary shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">Gestion des Évaluations Scolaires</CardTitle>
                        <CardDescription className="mt-1">
                          Création, gestion et analyse des évaluations avec stockage sécurisé. Plateforme complète de gestion des évaluations pour établissements africains.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-accent/20 hover:border-accent/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-8 w-8 text-accent shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <CardTitle className="text-lg">Bulletins et Rapports Scolaires</CardTitle>
                        <CardDescription className="mt-1">
                          Génération automatique des bulletins scolaires et rapports détaillés. Logiciel école moderne pour la digitalisation complète.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </article>

            {/* Security Notice */}
            <Card className="bg-accent/5 border-accent/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-accent shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-accent mb-2">Plateforme Sécurisée - Gestion Scolaire en Côte d'Ivoire</h3>
                    <p className="text-sm text-muted-foreground">
                      Solution dédiée aux établissements en Côte d'Ivoire et Afrique francophone. Toutes vos données sont stockées de manière sécurisée dans notre infrastructure Supabase. 
                      Authentification renforcée, chiffrement des données sensibles et audit complet des actions. 
                      Conformité RGPD pour la protection des données scolaires.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Right Column - Authentication Form */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-8">
            <LoginForm />
          </aside>
        </main>

        {/* Evaluation and Analytics Features */}
        <EvaluationFeatures />

        {/* Parent Reports Section */}
        <ParentReports />

        {/* Testimonials Section */}
        <SchoolTestimonials />

        {/* Press & Partners Section */}
        <PressPartners />

        {/* Local Support Section */}
        <LocalSupport />
      </div>
    </div>
  );
};

export default Index;
