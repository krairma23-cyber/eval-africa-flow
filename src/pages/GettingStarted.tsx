import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Rocket,
  School,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import Seo from "@/components/Seo";

const steps = [
  {
    icon: School,
    title: "1. Créer votre école",
    desc: "Inscrivez-vous, choisissez votre plan et renseignez les informations de votre établissement (nom, logo, adresse).",
    action: { label: "S'inscrire", to: "/auth" },
  },
  {
    icon: Users,
    title: "2. Inviter votre équipe",
    desc: "Partagez le code de votre école (join_code) avec les enseignants et administrateurs pour qu'ils rejoignent votre espace.",
    action: { label: "Utilisateurs", to: "/dashboard/users" },
  },
  {
    icon: GraduationCap,
    title: "3. Créer classes et matières",
    desc: "Configurez la structure pédagogique : niveaux, classes, matières, coefficients et périodes scolaires (trimestres).",
    action: { label: "Classes", to: "/dashboard/classrooms" },
  },
  {
    icon: BookOpen,
    title: "4. Ajouter enseignants et élèves",
    desc: "Créez les profils enseignants et inscrivez vos élèves (saisie manuelle ou import Excel). Les comptes parents sont créés automatiquement.",
    action: { label: "Élèves", to: "/dashboard/students" },
  },
  {
    icon: ClipboardList,
    title: "5. Saisir les notes",
    desc: "Créez des évaluations, définissez les types et coefficients, puis saisissez les notes. Les moyennes se calculent automatiquement.",
    action: { label: "Évaluations", to: "/dashboard/assessments" },
  },
  {
    icon: FileText,
    title: "6. Générer les bulletins",
    desc: "En un clic, générez les bulletins de toute une classe au format PDF avec le logo de votre école.",
    action: { label: "Bulletins", to: "/dashboard/reports" },
  },
  {
    icon: CreditCard,
    title: "7. Activer les paiements",
    desc: "Configurez Paystack pour recevoir les frais de scolarité en Mobile Money (Orange, MTN, Moov) ou carte bancaire.",
    action: { label: "Paramètres", to: "/dashboard/settings" },
  },
];

export default function GettingStarted() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Guide de démarrage | EvalScol Africa"
        description="Prenez EvalScol Africa en main en 7 étapes : création de l'école, invitation de l'équipe, classes, élèves, notes, bulletins et paiements."
        path="/getting-started"
      />

      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <Badge variant="outline" className="gap-1">
            <Rocket className="h-3 w-3" /> Démarrage rapide
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <section className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Guide de démarrage
          </h1>
          <p className="text-lg text-muted-foreground">
            Configurez votre école et générez vos premiers bulletins en moins d'une heure.
            Suivez ces 7 étapes dans l'ordre.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button asChild className="bg-[#10B981] hover:bg-[#0ea472] text-white">
              <Link to="/auth">Commencer maintenant</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/user-manual">Manuel complet</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-4 mb-12">
          {steps.map(({ icon: Icon, title, desc, action }) => (
            <Card key={title} className="hover:shadow-md transition">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link to={action.to}>{action.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Prêt à aller plus loin ?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Consultez le manuel utilisateur pour explorer toutes les fonctionnalités,
                  ou l'API pour intégrer EvalScol à vos autres outils.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link to="/user-manual">Manuel utilisateur</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/api-docs">Documentation API</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/support">Contacter le support</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} EvalScol Africa · Guide de démarrage
      </footer>
    </div>
  );
}
