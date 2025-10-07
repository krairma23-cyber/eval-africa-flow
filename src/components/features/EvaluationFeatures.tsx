import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, TrendingUp, BarChart3, FileCheck, PieChart, Target } from "lucide-react";

export function EvaluationFeatures() {
  return (
    <div className="mt-16 lg:mt-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Évaluations & Suivi des Progrès
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Système complet de gestion des évaluations avec analytics avancés pour suivre la progression de vos élèves
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Tests & Quiz</CardTitle>
            </div>
            <CardDescription className="text-base">
              Créez facilement des examens, contrôles et devoirs. Personnalisez les types d'évaluation selon vos besoins pédagogiques.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Multiples types d'évaluations
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Coefficients personnalisables
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Saisie rapide des notes
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Suivi des Progrès</CardTitle>
            </div>
            <CardDescription className="text-base">
              Suivez l'évolution de chaque élève avec des tableaux de bord détaillés et des indicateurs de performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Progression par trimestre
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Comparaison temporelle
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Alertes automatiques
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Analytics Avancés</CardTitle>
            </div>
            <CardDescription className="text-base">
              Visualisez les données avec des graphiques interactifs et des rapports détaillés pour une meilleure prise de décision.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Graphiques interactifs
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Statistiques par classe
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Rapports exportables
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <FileCheck className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Bulletins Automatisés</CardTitle>
            </div>
            <CardDescription className="text-base">
              Génération automatique des bulletins scolaires avec calculs de moyennes et appréciations personnalisées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Calculs automatiques
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Templates personnalisables
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Export PDF
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Statistiques Détaillées</CardTitle>
            </div>
            <CardDescription className="text-base">
              Accédez à des statistiques complètes par matière, classe, élève pour identifier les points forts et axes d'amélioration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Moyennes par matière
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Taux de réussite
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Classements
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Objectifs Pédagogiques</CardTitle>
            </div>
            <CardDescription className="text-base">
              Définissez et suivez les objectifs d'apprentissage pour chaque classe et matière avec des indicateurs de réussite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Suivi des compétences
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Évaluation continue
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                Bilans périodiques
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="mt-12 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/30">
        <CardContent className="pt-8 pb-8">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">
              Transformez votre gestion des évaluations
            </h3>
            <p className="text-muted-foreground mb-6">
              Gagnez du temps avec notre système intelligent d'évaluations et de suivi des progrès. 
              Des outils puissants pour une pédagogie efficace et des résultats mesurables.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                <span>Création rapide</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50">
                <BarChart3 className="h-4 w-4 text-accent" />
                <span>Analyses en temps réel</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Suivi personnalisé</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
